/****
 * Ejemplo de uso de promesas
 * aqui se muestran dos formas de encadenar promesas, una es tomando como parametro la respuesta de la primera promesa
 * la otra es mediante una funcion que maneja las promesas
 */



const sixSecDelay = new Promise((resolve, reject) => {
    //Esta promesa devuelve su respuesta luego de 6 segundos
    setTimeout(() => {
        resolve("Time passed 6 seconds.")
        
    },
    6000)
});

const threeSecDelay = (data) => new Promise((resolve, reject) => {
    //Esta promesa devuelve su respuesta luego de 3 segundos
    setTimeout(() => {
        resolve("Time passed 3 seconds.")
    },
    3000)
});

const XMilSecDelay = (millisec, next) => new Promise((resolve, reject) => {
    //Esta promesa devuelve su respuesta luego de el tiempo en milisegundos especificado por millisec 
    setTimeout(() => {
        console.log(`Time passed ${millisec} milliseconds.`);
        if(next?.length > 0){
            resolve(next);
        }else resolve(false);
        
    },
    millisec)
});

function delayHandler(timers) {
    //esta funcion toma timers que es un array de valores en milisegundos
    //correra XMilSecDelay con los parametros millisecs y el array next
    if(timers?.length > 0){
        const millisecs = timers[0] ?? 0;
        const next = timers.slice(1);
        XMilSecDelay(millisecs, next).then((res) => {
            if(res !== false) {
                delayHandler(res);
            }
        });
    }
}

const timersArray = [6000, 3000] // array de tiempo en milisegundos

delayHandler(timersArray);  //se corre funcion que maneja la promesa XMilSecDelay

sixSecDelay.then(res => {   //se corren promesas anidadas sixSecDelay y threeSecDelay
    console.log(res);
    threeSecDelay(res).then((res => {
        console.log(res);
    }))
})
