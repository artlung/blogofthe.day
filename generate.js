const fs = require('fs');

const sites = require('./sites.json');
const today = new Date().toISOString().split('T')[0];

const site = sites.blogs[Math.floor(Math.random() * sites.blogs.length)];
sites.dates[today] = site;

fs.writeFileSync('./sites.json', JSON.stringify(sites, null, 2));