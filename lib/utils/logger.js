/**
 * File logger
 * Author 罗祖雄
 * Date 2018/4/26
 */
const chalk = require("chalk");

const c = console;

const logger  = {
    info :  function (msg) {
        c.info(chalk.green(msg))
    },
    error : function (msg) {
        c.error(chalk.red(msg));
    },
    warn : function (msg) {
        c.warn(chalk.hex("#FF5415")(msg));
    },
    debug : function (msg) {
        c.warn(chalk.hex("#FF2E19")(msg));
    },
    log : function (msg) {
        c.log(chalk.hex("#AA9B9C")(msg));
    },
    underline : function (msg) {
        c.info(chalk.green.underline(msg))
    },
    bold : function (msg) {
        c.info(chalk.green.bold(msg))
    }
};

module.exports =  logger;