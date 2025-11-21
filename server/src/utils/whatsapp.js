const axios = require("axios");

class WhatsAppService {
    /**
     * Send a simple text message via WhatsApp
     * @param {string} phoneNumber - Recipient phone number
     * @param {string} message - Message text to send
     */
    async sendMessage(phoneNumber, link) {
        try {
            console.log(`Sending WhatsApp message to ${phoneNumber}: ${link}`);

           


            const body = {
      "template": {
        "namespace": process.env.ORAI_NAMESPACE,
        "name": "icset_2024_1",
        "components": [
          {
            "type": "header",
            "parameters": [
              {
                "type": "image",
                "image": {
                  "link": `https://betadev.ictkerala.org/api/event-admin/bulk-message/qr/${1002}`
                }
              }
            ]
          },
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "text": standardizeName("Test user")
              },
              {
                "type": "text",
                "text": date
              },
              {
                "type": "text",
                "text": capitalizeName("Time")
              },
              {
                "type": "text",
                "text":  "Name"
              },
              {
                "type": "text",
                "text": "test"
              },
              {
                "type": "text",
                "text": link
              }
            ]
          }
        ],
        "language": {
          "code": "en_US",
          "policy": "deterministic"
        }
      },
      "messaging_product": "whatsapp",
      "to": phoneNumber,
      "type": "template"
    }

            const response = await axios.post(
                "https://orailap.azurewebsites.net/api/cloud/Dialog",
                body,
                {
                    headers: {
                        "API-KEY": process.env.ORARI_API_KEY
                    }
                }
            );

            console.log("WhatsApp message sent successfully:", response.data);

            return {
                success: true,
                message: "Message sent successfully",
                data: response.data
            };
        } catch (error) {
            console.error("Error sending WhatsApp message:", error.response?.data || error.message);
            throw new Error(`Failed to send WhatsApp message: ${error.response?.data || error.message}`);
        }
    }
}

module.exports = new WhatsAppService();