import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface OpenAIErrorResponse {
  message: string;
  stack?: string;
}

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private configService: ConfigService) {
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Helper function to format date to YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to calculate end date based on start date and duration
  private calculateEndDate(startDate: Date, days: number): string {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return this.formatDate(endDate);
  }

  // Generate date examples for each day of the trip
  private generateActivityDateExamples(startDate: Date, duration: number): string {
    let examples = '';
    for (let i = 0; i < duration; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      examples += `Day ${i + 1}: ${this.formatDate(date)}\n`;
    }
    return examples;
  }

  async planTrip(prompt: string): Promise<OpenAI.Chat.ChatCompletionMessage> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a travel planning assistant. Create a detailed trip itinerary based on the user's request.
              Include destination-specific activities spread over suggested dates. If the user hasn't specified the
              number of days or preferences or city, ask for that information.
              
              Format the response as a clear, day-by-day itinerary with activities for each day.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      return response.choices[0].message;
    } catch (error: unknown) {
      const typedError = error as OpenAIErrorResponse;
      this.logger.error(`Error planning trip: ${typedError.message}`, typedError.stack);
      throw error;
    }
  }

  async generateTripJson(conversation: string): Promise<OpenAI.Chat.ChatCompletionMessage> {
    try {
      // Extract trip duration from conversation (default to 7 days if not found)
      const durationMatch = conversation.match(/(\d+)\s*days?/i);
      const tripDuration = durationMatch ? parseInt(durationMatch[1]) : 7;
      
      // Generate start date (today) and end date
      const startDate = new Date();
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.calculateEndDate(startDate, tripDuration);
      
      // Generate activity date examples
      const dateExamples = this.generateActivityDateExamples(startDate, tripDuration);

      // Create a JSON template with exact required structure
      const jsonTemplate = {
        trip: {
          destination: "Sample Destination",
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          budget: "1000 USD",
          activities: [
            {
              date: formattedStartDate,
              title: "Sample Activity 1",
              notes: "Description of activity 1",
              category: "Sightseeing",
              estimatedCost: 50
            },
            {
              date: this.calculateEndDate(startDate, 1),
              title: "Sample Activity 2",
              notes: "Description of activity 2", 
              category: "Food",
              estimatedCost: 30
            }
          ]
        }
      };
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a JSON formatting expert. Your task is to create a valid, correctly formatted JSON object based on trip details.
            
### CRITICAL WARNING ###
YOU MUST PRODUCE ONLY VALID, PARSEABLE JSON WITH ZERO SYNTAX ERRORS.
- All strings must be properly enclosed in double quotes
- All property names must be enclosed in double quotes
- All objects must have matching braces
- All arrays must have matching brackets
- Every property except the last one in an object must be followed by a comma
- The last property in an object must NOT have a trailing comma
- Check and double-check that all commas are correctly placed
- All dates must be in YYYY-MM-DD format

### TEMPLATE TO FOLLOW ###
Use exactly this structure, with properly escaped quote marks:
\`\`\`json
${JSON.stringify(jsonTemplate, null, 2)}
\`\`\`

### REQUIREMENTS ###
1. All activity dates MUST be between ${formattedStartDate} and ${formattedEndDate}, inclusive. 
2. Format all dates as YYYY-MM-DD.
3. Use these exact dates for the trip activities:
${dateExamples}
4. Each property name and string value must be enclosed in double quotes
5. Numbers should NOT have quotes
6. The "estimatedCost" field should be a number without currency symbols or quotes
7. Do not add any extra fields not shown in the template
8. Return ONLY the JSON object, nothing else

FINAL CHECK: After creating the JSON, verify that all braces, brackets, and commas are correct. Make sure there are no trailing commas after the last property in any object. Ensure all strings (including dates) are properly quoted.`,
          },
          { role: 'user', content: conversation },
        ],
        temperature: 0.1, // Lower temperature for more deterministic output
        response_format: { type: "json_object" } // Enforce JSON response format
      });

      return response.choices[0].message;
    } catch (error: unknown) {
      const typedError = error as OpenAIErrorResponse;
      this.logger.error(
        `Error generating trip JSON: ${typedError.message}`,
        typedError.stack,
      );
      throw error;
    }
  }
}
