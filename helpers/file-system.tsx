
import axios from 'axios';
import configSettings from '../config.json';

export const downloadFile = async (url: string, timeout: number = null): Promise<ArrayBuffer> => {
    let data: ArrayBuffer;

    await axios.get(url, {
        timeout: timeout,
        responseType: 'arraybuffer'
    }).then(response => {
        data = response.data;
    }).catch(ex => {
        console.log(ex);
        throw ex;
    });

    return data;
}

export const pinJsonToIpfs = async (json: object) : Promise<string> => {
    var ipfsUrl = '';
    const apiUrl = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

    await axios.post(apiUrl, json, {
       headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': configSettings.pinataApiKey,
          'pinata_secret_api_key': configSettings.pinataSecretApiKey
       }
    }
    ).then((response) => {
       ipfsUrl = `https://ipfs.infura.io/ipfs/${response.data.IpfsHash}`;
    }).catch((ex) => {
       console.log(ex);
       throw ex;
    });

    return ipfsUrl;
 };

 export const pinFileToIpfs = async (fileUrl: string) : Promise<string> => {
    var ipfsUrl = '';
    const apiUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    const data = await downloadFile(fileUrl);
    
    let formData = new FormData();
    formData.append('file', new Blob([data]));

    await axios.post(apiUrl, formData, {
       headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': configSettings.pinataApiKey,
          'pinata_secret_api_key': configSettings.pinataSecretApiKey
       }
    }
    ).then(response => {
       ipfsUrl = `https://ipfs.infura.io/ipfs/${response.data.IpfsHash}`;
    }).catch(ex => {
       console.log(ex);
       throw ex;
    });

    return ipfsUrl;
 };