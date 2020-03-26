# Email service
Email service for node clients to send emails via sendgrid and mailcatcher

## Getting Started

### Installation

Add this line in package.json `"@kudosinc/email-service": "git+https://git@github.com/KudosInc/email-service.git#v1.0.0"` and run `npm install`.

### Setting up for mailcatcher

Following environment varialbes need to be set to send mail via mailcatcher.

Assuming you already have mailcatcher running locally via docker on the port `1025` and the service name is mailcatcher, set these environment variables

```
EMAIL_CLIENT=mailcatcher
SMTP_HOST=mailcatcher
SMTP_PORT=1025
```
### Setting up for sendgrid

To send emails via sendgrid, a template should be created in the sendgrid app, as this service sends email only using the template id.

Set the following environment variables to configure email service to send emails via sengrid

```
EMAIL_CLIENT=sendgrid
SENDGRID_API_KEY=your_key
```

### Send Emails

To send emails look at the example below.

```javascript
const emailService = require('@kudosinc/email-service');

await emailService.sendMail({
  html: 'valid html', //optional, will be respected only in mailcatcher
  to: [{ email: 'test@test.com', name: 'test test' }],
  from: { email: 'sender@test.com', name: 'sender sender' },
  params: { name: 'sender', company: 'Kudos Inc' }, // required for sendgrid, optional for mailcatcher
  templateId: 'template-id', // required for sendgrid to work
  subject: 'Subject of the email',
});

```

**Note:**
If the `html` value is not set when using mailcatcher, it'll concatenate all parameters as a list, and display them as html. The mailcatcher option will not fetch the template html from sendgrid, so the display will not be the same.
