module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets/js");
    eleventyConfig.addPassthroughCopy("feed.xml");

    eleventyConfig.addShortcode("blogToday", function() {
        const fs = require('fs');
        const dates = require('./dates.json');
        const sites = require('./sites.json');
        const today = new Date().toISOString().split('T')[0];
        return dates.dates[today];
    });
    eleventyConfig.addShortcode("blogsByDate", function() {
        const fs = require('fs');
        const dates = require('./dates.json');
        return dates.dates;
    });
};
