'use server';

/**
 * @fileOverview An AI agent for analyzing energy consumption patterns and predicting unusual activity.
 *
 * - analyzeConsumptionPatterns - A function that analyzes energy consumption patterns and predicts unusual activity.
 * - AnalyzeConsumptionPatternsInput - The input type for the analyzeConsumptionPatterns function.
 * - AnalyzeConsumptionPatternsOutput - The return type for the analyzeConsumptionPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeConsumptionPatternsInputSchema = z.object({
  deviceData: z.array(
    z.object({
      deviceId: z.string().describe('The unique identifier of the device.'),
      deviceName: z.string().describe('The name of the device.'),
      powerConsumption: z
        .number()
        .describe('The current power consumption of the device in watts.'),
      usageHoursToday: z
        .number()
        .describe('The number of hours the device has been used today.'),
      expectedUsage: z
        .string()
        .optional()
        .describe('The user defined expected usage of this device'),
    })
  ).describe('An array of device data objects.'),
  tariffRates: z
    .object({
      high: z.number().describe('The high tariff rate in ₹/kWh.'),
      low: z.number().describe('The low tariff rate in ₹/kWh.'),
    })
    .describe('The current electricity tariff rates.'),
  location: z.string().describe('The current location of the user (e.g., Pune).'),
});
export type AnalyzeConsumptionPatternsInput = z.infer<
  typeof AnalyzeConsumptionPatternsInputSchema
>;

const AnalyzeConsumptionPatternsOutputSchema = z.object({
  analysisResults: z.array(
    z.object({
      deviceId: z.string().describe('The unique identifier of the device.'),
      deviceName: z.string().describe('The name of the device.'),
      isUnusual: z
        .boolean()
        .describe(
          'Whether the power consumption pattern of this device is unusual.'
        ),
      predictedConsumption: z
        .number()
        .optional()
        .describe(
          'The predicted power consumption of the device based on current tasks.'
        ),
      reason: z
        .string()
        .describe('The reason for the unusual consumption pattern.'),
      suggestion: z.string().describe('Suggestions for the user to resolve the issue.'),
    })
  ).describe('An array of analysis results for each device.'),
  overallAnalysis: z
    .string()
    .describe('An overall analysis of the energy consumption patterns.'),
});

export type AnalyzeConsumptionPatternsOutput = z.infer<
  typeof AnalyzeConsumptionPatternsOutputSchema
>;

export async function analyzeConsumptionPatterns(
  input: AnalyzeConsumptionPatternsInput
): Promise<AnalyzeConsumptionPatternsOutput> {
  return analyzeConsumptionPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeConsumptionPatternsPrompt',
  input: {schema: AnalyzeConsumptionPatternsInputSchema},
  output: {schema: AnalyzeConsumptionPatternsOutputSchema},
  prompt: `You are an expert energy consumption analyst.

You are provided with data about various devices in a home, their power consumption, and current electricity tariff rates for {{{location}}}.

Analyze the data to identify any unusual consumption patterns or predict higher-than-expected consumption based on current device usage. Consider user defined expected usage if available.

Device Data:
{{#each deviceData}}
  - Device ID: {{deviceId}}
  - Device Name: {{deviceName}}
  - Power Consumption: {{powerConsumption}} watts
  - Usage Hours Today: {{usageHoursToday}} hours
  {{#if expectedUsage}}
   - Expected Usage: {{expectedUsage}}
  {{/if}}
{{/each}}

Tariff Rates:
- High: {{tariffRates.high}} ₹/kWh
- Low: {{tariffRates.low}} ₹/kWh

Location: {{location}}

Provide an analysis for each device, indicating whether its consumption pattern is unusual, the predicted consumption (if applicable), the reason for the unusual consumption, and suggestions for the user to resolve the issue.

Also, provide an overall analysis of the energy consumption patterns in the home.

Ensure that the analysis results and overall analysis are accurate and helpful to the user.

Output in JSON format.
`,
});

const analyzeConsumptionPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeConsumptionPatternsFlow',
    inputSchema: AnalyzeConsumptionPatternsInputSchema,
    outputSchema: AnalyzeConsumptionPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
