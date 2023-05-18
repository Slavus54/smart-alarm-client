const Cookies = require('js-cookie')

export class CookieWorker {
    constructor(label = '') {
        this.label = label
    }

    save(data, time) {
        document.cookie = `${this.label}=${JSON.stringify(data)}; max-age=${time * 60}`
    }

    gain() {
        let data = Cookies.get(this.label)

        if (data !== undefined && data !== null) {
            return JSON.parse(data)
        } else {
            return null
        }
    }
}