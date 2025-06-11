const imagenExomlapi = async (prompt) => {
 
    if (!prompt.length) throw Error (`prompt tidak boleh kosong.`)
 
    // list config
    const model = ["imagen_3", "imagen_3_5"]
    const imageSize = ["1024x1024", "1024x1792", "1792x1024"]
    const responseFormat = ["url", "b64_json"] 
 
    // atur konfig sesukamu
    const payload = {
        "prompt": prompt, //imajinasi kamu
        "model": model[1], // 0=imagen_3, 1=imagen_3_5
        "size": imageSize[0], // 0=square, 1=portrait, 2=landscape
        "response_format": responseFormat[0] // 0=url output, 1=base64 output
    }
 
    const headers = {
        "accept": "*/*",
            "content-type": "application/json",
            "Referer": "https://imagen.exomlapi.com/",
    }
 
    const response = await fetch("https://imagen.exomlapi.com/v1/images/generations", {
        headers,
        "body": JSON.stringify(payload),
        "method": "POST"
    });
 
    if (!response.ok) throw Error (`gagal membuat gambar ${prompt}. server status: ${response.status} ${response.statusText}`)
 
    const data = await response.json()
 
    return {
      status: true,
      ...data
    }
}
 
// cara pakai
export default imagenExomlapi
