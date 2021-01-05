const inquirer = require('inquirer')
const fs = require('fs');
const clipboardy = require('clipboardy');
var crypto = require('crypto');


inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

function savePässword() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            messages: 'Enter name of password'
        },
        {
            type: 'password',
            name: 'password',
            messages: 'Enter password'
        }
    ]).then(value => {
        cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        value.password = encryptPassword(cipher, value.password)

        const allpass = fs.readFileSync('./resources/passwords.json')
        jsoned = JSON.parse(allpass);
        jsoned.password.push(value)
        fs.writeFileSync('./resources/passwords.json', JSON.stringify(jsoned))
        
    })
}

function encryptPassword(cipher, password) {
    cipher.write(password)
    cipher.end()
    return Buffer.concat([salt, iv, cipher.read()]).toString('base64')
}

function findPassword (passwordAll) {
    const allpass = fs.readFileSync('./resources/passwords.json')
    const jsoned = JSON.parse(allpass);
    // const password = jsoned.password.find(value => value.name === valueInq.name)
    // console.log(password)
    inquirer.prompt([
        {
            type: 'autocomplete',
            name: 'name',
            messages: 'password to retrieve',
            source: function(_answersSoFar, input) {
                return input ? jsoned.password.filter(value => value.name.includes(input)) : jsoned.password
                 
            }
        },

    ]).then(valueInq => {
        const password = jsoned.password.find(value => value.name === valueInq.name)
        try {
            encrypted = Buffer.from(password.password, 'base64');
            const salt_len = iv_len = 16;
            salt = encrypted.slice(0, salt_len);
            iv = encrypted.slice(0+salt_len, salt_len+iv_len);
            key = crypto.pbkdf2Sync(passwordAll, salt, 1000, 256/8, 'sha256');

            decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            
            decipher.write(encrypted.slice(salt_len+iv_len));
            decipher.end();

            decrypted = decipher.read();
            clipboardy.writeSync(decrypted.toString());
            console.log('🦄')
        } catch {
            console.log('Wrong password :\'(')
        }

    })
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 

function createPassword () {
    inquirer.prompt([
        {
            type: 'number',
            name: 'password',
            message: 'Enter length of password'
        }, {
            type: 'input',
            name: 'name',
            message: 'Enter name of password'
        }
    ]).then(result => {
        cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        result.password = encryptPassword(cipher, makeid(result.password))

        const allpass = fs.readFileSync('./resources/passwords.json')
        jsoned = JSON.parse(allpass);
        jsoned.password.push(result)
        fs.writeFileSync('./resources/passwords.json', JSON.stringify(jsoned))
    })
}

inquirer.prompt([
    {
        type: 'password',
        name: 'value',
        message: 'Enter password',
    }
]).then(password => {
    const passwordAll = password.value
    salt = crypto.randomBytes(16);
    iv = crypto.randomBytes(16);
    key = crypto.pbkdf2Sync(password.value, salt, 1000, 256/8, 'sha256');
    
    inquirer.prompt([
        {
            type: 'list',
            name: 'do',
            message: 'Que voulez vous faire ?',
            choices: [{
                name: 'Save a password',
                value: 'save'
            }, {
                name: 'retrieve a password',
                value: 'find'
            }, {
                name: 'Create a password',
                value: 'create'
            }]
        }
    ]).then(answer => {
        if (answer.do === 'save') {
            savePässword()
        } else if (answer.do === 'find') {
            findPassword(passwordAll)
        } else if (answer.do === 'create') {
            createPassword()
        }
    })
})



