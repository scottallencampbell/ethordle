
export async function fulfillWithTimeLimit(timeLimit, task, failureValue) {
    let timeout;
    const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
            resolve(failureValue);
        }, timeLimit);
    });
    
    const response = await Promise.race([task, timeoutPromise]);

    if (timeout) { 
        clearTimeout(timeout);
    }
    return response;
}
