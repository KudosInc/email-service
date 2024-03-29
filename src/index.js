const nodemailer = require('nodemailer');
const Email = require('email-templates');
const request = require('./request');

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

const SUPPORTED_EMAIL_CLIENTS = {
  sendgrid: 'sendgrid',
  smtp: 'smtp',
};

const postToSengrid = ({
  params, subject, to, from, templateId, category, uniqueArgs,
}) => {
  const body = {
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
    categories: [category],
    custom_args: JSON.stringify(uniqueArgs),
  };
  return request.post({
    uri: SENDGRID_API_URL,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body,
  });
};

const address = ({ name, email }) => `"${name}" <${email}>`;

const paramsHtml = (params) => {
  if (!params) {
    return '';
  }
  const nonEmptyKeys = Object.keys(params).filter((k) => params[k]);
  return `
    This is an email without the actual template, actual email will be sent with these parameters: <br />
    ${nonEmptyKeys.map((key) => `<b>${key}</b>: ${params[key]}`).join('<br />')}
  `;
};

const postToSmtp = ({
  from, to, cc, subject, params, html, template, category, uniqueArgs,
}) => {
  const smtpApiHeader = {
    category: [category],
    unique_args: uniqueArgs,
  };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER_NAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  if (!template) {
    transporter.sendMail({
      from: address(from),
      to: to.map(address),
      cc,
      subject,
      html: html || paramsHtml(params),
      headers: {
        'X-SMTPAPI': JSON.stringify(smtpApiHeader),
      },
    });
  } else {
    const email = new Email({
      transport: transporter,
      message: { from: address(from) },
      send: true,
    });

    email
      .send({
        template,
        message: { to: to.map(address) },
        locals: params,
      });
  }
};
/**
 * Send Mail
 * @param {Object} args
 * from: {
 *   email: String, name: String
 * }
 * to: [{
 *   email: String, name: String
 * }],
 * params: [key: value]
 * subject: String,
 * templateId: String
 */
const sendMail = (args) => {
  switch (process.env.EMAIL_CLIENT) {
    case SUPPORTED_EMAIL_CLIENTS.sendgrid:
      return postToSengrid(args);
    case SUPPORTED_EMAIL_CLIENTS.smtp:
      return postToSmtp(args);
    default:
      throw new Error(`Unsupported email client: ${process.env.EMAIL_CLIENT}`);
  }
};

module.exports = { sendMail };
