const request = require('./request');

const SENDGRID_API_URL = '';

const SUPPORTED_EMAIL_CLIENTS = {
  sendgrid: {
    url: 'https://api.sendgrid.com/v3/mail/send',
  },
  mailcatcher: 1,
};

const postToSengrid = ({
  params, subject, to, from, templateId,
}) => {
  const data = {
    personalizations: [{
      to,
      dynamic_template_data: {
        ...params,
        subject,
      },
    }],
    from,
    subject,
    reply_to: from,
    template_id: templateId,
  };
  return request.post({
    uri: SUPPORTED_EMAIL_CLIENTS.sendgrid.url,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    data,
  });
};

const userEmailFormat = (user) => `"${user.name}" <${user.email}>`;

const postToMailCatcher = ({ from, to, subject, params }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER_NAME,
      pass: process.env.SMTP_PASSWORD,
    }
  });
  const html = `
    This is an email without the actual template, actual email will be sent with these parameters:
    ${Object.keys(params).map((key) => `<b>${key}</b>: ${params[key]}`).join('<br />')}
  `;
  transporter.sendMail({
    from: userEmailFormat(from),
    to: to.map(userEmailFormat),
    subject,
    html,
  });
};
/**
 * 
 * @param {Object} args
 * From: {
 *   email: String, name: String
 * }
 * To: [{
 *   email: String, name: String
 * }],
 * params: [key: value]
 * subject: String
 */
const send = (args) => {
  switch(process.env.EMAIL_CLIENT) {
    case SUPPORTED_EMAIL_CLIENTS.sendgrid:
      return postToSengrid(args);
    case SUPPORTED_EMAIL_CLIENTS.mailcatcher:
      return postToMailCatcher(args);
    default:
      throw new Error('Unsupported email client');
  }
}

module.exports = send;
