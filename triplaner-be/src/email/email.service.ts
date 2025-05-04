import { Injectable, Logger } from '@nestjs/common';
import { mailjetConfig } from '../config/mailjet.config';
import * as Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
  private mailjet: any;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.mailjet = Mailjet.Client.apiConnect(
      mailjetConfig.apiKey,
      mailjetConfig.apiSecret,
    );
  }

  /**
   * Send an invitation email to a user
   * @param email Recipient email address
   * @param inviterName Name of the user sending the invitation
   * @param tripName Name of the trip
   * @param tripStartDate Start date of the trip
   * @param tripEndDate End date of the trip
   * @returns Promise resolving to the Mailjet response
   */
  async sendTripInvitation(
    email: string,
    inviterName: string,
    tripName: string,
    tripStartDate: string,
    tripEndDate: string,
  ): Promise<any> {
    try {
      const formattedStartDate = new Date(tripStartDate).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        },
      );

      const formattedEndDate = new Date(tripEndDate).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        },
      );

      const response = await this.mailjet
        .post('send', { version: mailjetConfig.version })
        .request({
          Messages: [
            {
              From: {
                Email: mailjetConfig.fromEmail,
                Name: mailjetConfig.fromName,
              },
              To: [
                {
                  Email: email,
                },
              ],
              Subject: `${inviterName} invited you to join a trip: ${tripName}`,
              HTMLPart: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">You've Been Invited!</h1>
                  </div>
                  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
                    <p>Hello,</p>
                    <p><strong>${inviterName}</strong> has invited you to join a trip:</p>
                    <div style="background-color: #f9fafb; border-radius: 5px; padding: 15px; margin: 15px 0;">
                      <h2 style="margin-top: 0; color: #4f46e5;">${tripName}</h2>
                      <p><strong>When:</strong> ${formattedStartDate} - ${formattedEndDate}</p>
                    </div>
                    <p>To accept this invitation, please log in to your Triplaner account.</p>
                    <p>If you don't have an account yet, you can create one using this email address.</p>
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations" 
                        style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        View Invitation
                      </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
                  </div>
                </div>
              `,
              TextPart: `
Hello,

${inviterName} has invited you to join a trip: ${tripName}

When: ${formattedStartDate} - ${formattedEndDate}

To accept this invitation, please log in to your Triplaner account. If you don't have an account yet, you can create one using this email address.

Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations

This is an automated message, please do not reply to this email.
              `,
            },
          ],
        });

      this.logger.log(`Invitation email sent to ${email} for trip ${tripName}`);
      return response.body;
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send notification to trip creator and participants that someone accepted an invitation
   * @param recipientEmails Array of recipient email addresses
   * @param newParticipantName Name of the user who accepted the invitation
   * @param tripName Name of the trip
   * @param tripId ID of the trip for linking
   * @returns Promise resolving to the Mailjet response
   */
  async sendInvitationAcceptedNotification(
    recipientEmails: string[],
    newParticipantName: string,
    tripName: string,
    tripId: string,
  ): Promise<any> {
    try {
      if (!recipientEmails.length) {
        this.logger.warn('No recipients provided for accepted invitation notification');
        return;
      }

      const recipients = recipientEmails.map(email => ({ Email: email }));
      
      const response = await this.mailjet
        .post('send', { version: mailjetConfig.version })
        .request({
          Messages: [
            {
              From: {
                Email: mailjetConfig.fromEmail,
                Name: mailjetConfig.fromName,
              },
              To: recipients,
              Subject: `${newParticipantName} joined your trip: ${tripName}`,
              HTMLPart: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">New Trip Participant!</h1>
                  </div>
                  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
                    <p>Hello,</p>
                    <p><strong>${newParticipantName}</strong> has accepted your invitation and joined the trip:</p>
                    <div style="background-color: #f9fafb; border-radius: 5px; padding: 15px; margin: 15px 0;">
                      <h2 style="margin-top: 0; color: #4f46e5;">${tripName}</h2>
                    </div>
                    <p>You can now collaborate on planning activities and arrangements for the trip.</p>
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/trips/${tripId}" 
                        style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        View Trip
                      </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
                  </div>
                </div>
              `,
              TextPart: `
Hello,

${newParticipantName} has accepted your invitation and joined the trip: ${tripName}

You can now collaborate on planning activities and arrangements for the trip.

Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/trips/${tripId}

This is an automated message, please do not reply to this email.
              `,
            },
          ],
        });

      this.logger.log(`Invitation accepted notification sent to ${recipientEmails.join(', ')} for trip ${tripName}`);
      return response.body;
    } catch (error) {
      this.logger.error(`Failed to send invitation accepted notification:`, error);
      throw error;
    }
  }

  /**
   * Send notification to trip creator and participants that someone declined an invitation
   * @param recipientEmails Array of recipient email addresses
   * @param declinedByName Name of the user who declined the invitation
   * @param tripName Name of the trip
   * @param tripId ID of the trip for linking
   * @param reason Optional reason for declining
   * @returns Promise resolving to the Mailjet response
   */
  async sendInvitationDeclinedNotification(
    recipientEmails: string[],
    declinedByName: string,
    tripName: string,
    tripId: string,
    reason?: string,
  ): Promise<any> {
    try {
      if (!recipientEmails.length) {
        this.logger.warn('No recipients provided for declined invitation notification');
        return;
      }

      const recipients = recipientEmails.map(email => ({ Email: email }));
      
      const response = await this.mailjet
        .post('send', { version: mailjetConfig.version })
        .request({
          Messages: [
            {
              From: {
                Email: mailjetConfig.fromEmail,
                Name: mailjetConfig.fromName,
              },
              To: recipients,
              Subject: `${declinedByName} declined invitation to trip: ${tripName}`,
              HTMLPart: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Invitation Declined</h1>
                  </div>
                  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
                    <p>Hello,</p>
                    <p><strong>${declinedByName}</strong> has declined your invitation to join the trip:</p>
                    <div style="background-color: #f9fafb; border-radius: 5px; padding: 15px; margin: 15px 0;">
                      <h2 style="margin-top: 0; color: #4f46e5;">${tripName}</h2>
                      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                    </div>
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/trips/${tripId}" 
                        style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        View Trip
                      </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
                  </div>
                </div>
              `,
              TextPart: `
Hello,

${declinedByName} has declined your invitation to join the trip: ${tripName}
${reason ? `\nReason: ${reason}` : ''}

Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/trips/${tripId}

This is an automated message, please do not reply to this email.
              `,
            },
          ],
        });

      this.logger.log(`Invitation declined notification sent to ${recipientEmails.join(', ')} for trip ${tripName}`);
      return response.body;
    } catch (error) {
      this.logger.error(`Failed to send invitation declined notification:`, error);
      throw error;
    }
  }
}
