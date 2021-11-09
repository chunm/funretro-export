const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { exit } = require('process');

const [url, format, file] = process.argv.slice(2);
var fileFormatName2;

if (!url) {
    throw 'Please provide a URL as the first argument.';
}
if (format !== "format1" && format !== "format2") {
    throw 'Please specify the format as format1 or format2 as the second argument.';
}

async function run() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('.easy-card-list');

    const boardTitle = await page.$eval('.board-name', (node) => node.innerText.trim());

    if (!boardTitle) {
        throw 'Board title does not exist. Please check if provided URL is correct.'
    }

    if(format === "format1"){
        if (!file) {
            throw 'Please provide a file name as the third argument.'
        }
        return format1(page, boardTitle);
    }else if(format === "format2"){
        fileFormatName2 = boardTitle.replace(/ /g, "") + ".csv";
        return format2(page);
    }

}

async function format1(page, boardTitle) {
    let parsedText = boardTitle + '\n\n';

    const columns = await page.$$('.easy-card-list');

    for (let i = 0; i < columns.length; i++) {
        const columnTitle = await columns[i].$eval('.column-header', (node) => node.innerText.trim());

        const messages = await columns[i].$$('.easy-board-front');
        if (messages.length) {
            parsedText += columnTitle + '\n';
        }
        for (let i = 0; i < messages.length; i++) {
            const messageText = await messages[i].$eval('.easy-card-main .easy-card-main-content .text', (node) => node.innerText.trim());
            const votes = await messages[i].$eval('.easy-card-votes-container .easy-badge-votes', (node) => node.innerText.trim());
            parsedText += `- ${messageText} (${votes})` + '\n';
        }

        if (messages.length) {
            parsedText += '\n';
        }
    }

    return parsedText;
}

async function format2(page) {
    let parsedText = "";
    let parsedTextArray = [];
    let rows = 1;
    
    const columns = await page.$$('.easy-card-list');
    const columnLength = columns.length;

    for (let i = 0; i < columnLength; i++) {
        parsedTextArray[i] = [];

        const columnTitle = await columns[i].$eval('.column-header', (node) => node.innerText.trim());

        if(columnTitle) {
            parsedTextArray[i].push(columnTitle);
        }else{
            parsedTextArray[i].push("");
        }

        const messages = await columns[i].$$('.easy-board-front');
        const messagesLength = messages.length;
        if(messagesLength > rows) rows = messagesLength + 1;
        for (let j = 0; j < messagesLength; j++) {
            const messageText = await messages[j].$eval('.easy-card-main .easy-card-main-content .text', (node) => node.innerText.trim());
            const votes = await messages[j].$eval('.easy-card-votes-container .easy-badge-votes', (node) => node.innerText.trim());
            if(votes > 0) {
                parsedTextArray[i].push(messageText);
            }else{
                parsedTextArray[i].push("");
            }
        }

    }

    for(let i = 0; i < rows; i++) {
        for(let j = 0; j < columnLength; j++) {
            if(parsedTextArray[j][i] !== "" && parsedTextArray[j][i] !== undefined){
                parsedText += parsedTextArray[j][i];
                if(j !== rows - 1){
                    parsedText += ", ";
                }
            }
        }
        parsedText = parsedText.substring(0, parsedText.length - 2) + '\n';
    }
    
    return parsedText;
}

function writeToFile(filePath, data) {
    if(format === "format2") filePath = fileFormatName2;
    const resolvedPath = path.resolve(filePath || `../${data.split('\n')[0].replace('/', '')}.txt`);
    fs.writeFile(resolvedPath, data, (error) => {
        if (error) {
            throw error;
        } else {
            console.log(`Successfully written to file at: ${resolvedPath}`);
        }
        process.exit();
    });
}

function handleError(error) {
    console.error(error);
}

run().then((data) => writeToFile(file, data)).catch(handleError);