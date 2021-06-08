# Email service
Email service for node clients to send emails via sendgrid and mailcatcher

## Getting Started

### Installation

Add this line in package.json `"@kudosinc/email-service": "git+https://git@github.com/KudosInc/email-service.git#v1.0.0"` and run `npm install`.

### Setting up for smtp

Following environment varialbes need to be set to send mail via smtp.

Assuming you already have smtp running locally via docker on the port `1025` and the service name is smtp, set these environment variables

```
EMAIL_CLIENT=smtp
SMTP_HOST=mailcatcher
SMTP_PORT=1025
SMTP_USER_NAME=username
SMTP_PASSWORD=password
```
### Setting up for sendgrid

To send emails via sendgrid, a template should be created in the sendgrid app, as this service sends email only using the template id.

Set the following environment variables to configure email service to send emails via sengrid

```
EMAIL_CLIENT=sendgrid
SENDGRID_API_KEY=your_key
```

#### Creating templates

To send emails via sendgrid, we need templates created in the sendgrid, and we use the template_id as the sent parameter. The email templates can be cretead in the [sendgrid app](https://mc.sendgrid.com/dynamic-templates)

### Send Emails

To send emails look at the example below.

```javascript
const emailService = require('@kudosinc/email-service');

await emailService.sendMail({
  html: 'valid html', //optional, will be respected only in smtp
  to: [{ email: 'test@test.com', name: 'test test' }],
  from: { email: 'sender@test.com', name: 'sender sender' },
  params: { name: 'sender', company: 'Kudos Inc' }, // required for sendgrid, optional for smtp
  templateId: 'template-id', // required for sendgrid to work
  subject: 'Subject of the email',
});

```
### To send an email with local template
```javascript
const sendEmail = async () => {
  await emailService.sendMail({
    to: [{ email: 'test@test.com', name: 'test test' }],
    from: { email: supportEmail, name: 'Kudos Administrator' },
    params: {
      user: { name: 'Colin' },
      company: 'Kudos Inc',
      subject: 'A new page has been published',
      page: {
        shareMessage: 'Test Message',
        path: 'www.google.com',
        title: 'New Page',
      },
      organization: {
        header: 'Kudos Inc',
        logo: 'link',
      },
    },
    template: 'relative/path/to/your/pug/template', 
  });
};

```

**Note:**
If the `html` value is not set when using smtp, it'll concatenate all parameters as a list, and display them as html. The smtp option will not fetch the template html from sendgrid, so the display will not be the same.
