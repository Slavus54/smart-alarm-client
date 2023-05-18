import axios from 'axios'

export async function sender(base) {

    let url = base

    return async function(pdfType, object, delay) {
        await axios.post(`${url}/generate-pdf`, {pdfType, ...object})
     
        let result = new Promise((resolve, reject) => {
            
            setTimeout(async () => {
                let data = await axios.post(`${url}/get-pdf`, {pdfType}, {responseType: 'blob'})
    
                let blob = new Blob([data.data], {type: 'application/pdf'})

                resolve(blob)
               
            }, delay * 1000)
        })

        return result     
    }
}