const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

sgMail.setApiKey(sendgridAPIKey)
sgMail.send({
    to:'theforgottenbadge@gmail.com', 
    from:'theforgottenbadge@gmail.com', 
    subject: "This is my first mail creation",
    text:'Test mail. sent from node application'
})