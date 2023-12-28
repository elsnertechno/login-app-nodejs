

class Configs {
    utcDefault() {
        let date = new Date();
        return moment.utc(date).format();
    }
}

module.exports = new Configs();
