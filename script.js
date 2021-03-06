import {TRAINING_DATA} from 'https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/TrainingData/real-estate-data.js';


// Input feature pairs (House size, Number of Bedrooms)

const INPUTS = TRAINING_DATA.inputs;


// Current listed house prices in dollars given their features above 

// (target output values you want to predict).

const OUTPUTS = TRAINING_DATA.outputs;


// Shuffle the two arrays in the same way so inputs still match outputs indexes.

tf.util.shuffleCombo(INPUTS, OUTPUTS);



// Input feature Array of Arrays needs 2D tensor to store.

const INPUTS_TENSOR = tf.tensor2d(INPUTS);


// Output can stay 1 dimensional.

const OUTPUTS_TENSOR = tf.tensor1d(OUTPUTS);

// Function to take a Tensor and normalize values, lo transforma en valores comprendidos entre 0 y 1

// with respect to each column of values contained in that Tensor.

function normalize(tensor, min, max) {

    const result = tf.tidy(function() {
  
      // Find the minimum value contained in the Tensor.
  
      const MIN_VALUES = min || tf.min(tensor, 0);
  
   
  
      // Find the maximum value contained in the Tensor.
  
      const MAX_VALUES = max || tf.max(tensor, 0);
  
   
  
      // Now subtract the MIN_VALUE from every value in the Tensor
  
      // And store the results in a new Tensor.
      //La función 'tf.sub' se usa para restar el tensor de valores mínimos, que es un tensor 1d, de su tensor de entrada, que es un tensor 2d.
  
      const TENSOR_SUBTRACT_MIN_VALUE = tf.sub(tensor, MIN_VALUES);
  
   
  
      // Calculate the range size of possible values.
      //Calcule el tamaño del rango de valores en el tensor original restando el valor máximo del mínimo
  
      const RANGE_SIZE = tf.sub(MAX_VALUES, MIN_VALUES);
  
      // Calculate the adjusted values divided by the range size as a new Tensor.
    // Divida los valores ajustados por el tamaño del rango y almacene el resultado en un nuevo tensor.
      const NORMALIZED_VALUES = tf.div(TENSOR_SUBTRACT_MIN_VALUE, RANGE_SIZE);
  
   
  
      return {NORMALIZED_VALUES, MIN_VALUES, MAX_VALUES};
  
    });
  
    return result;
  
  
  }

  // Normalize all input feature arrays and then 

// dispose of the original non normalized Tensors.

const FEATURE_RESULTS = normalize(INPUTS_TENSOR); 

console.log('Normalized Values:');

FEATURE_RESULTS.NORMALIZED_VALUES.print();//Tensor de entrada normalizado con valores entre 0 y 1


console.log('Min Values:');

FEATURE_RESULTS.MIN_VALUES.print();//Minimo valor 


console.log('Max Values:');

FEATURE_RESULTS.MAX_VALUES.print(); //Máximo


INPUTS_TENSOR.dispose();

///Creación del model

const model = tf.sequential();

//Añadimos las capas al model:

model.add(tf.layers.dense({inputShape: [2], units: 1}));

//dense signigica que cada neurona está conectada a todas la entradas
//inputShape hace referencia al nº de características de cada entrtada (tamaño y baños)
//units hace referencia al º de neuronas en la capa
//En este caso no se añade una función de activación

//Pintamos el modelo con summary:

model.summary()

//Llamos la función de entremaiento

train()

//Esta función coge el modelo y ajusta los pesos y bias para aprender de las entradas

async function train () {
    //Pasos para entrenar el modelo:
    //1. Definir el learning_rate: rango de magnitud de cambio de los pesos y bias
    //2. Optimizer: método usado para ajustar y encontrar valores para los pesos y bias. 
    //3. Loss: el optimizador emplea los valores obtenidos de la función loss function y learning_rate
    // para el ajuste de los pesos y bias
    //4. ValidationSplit: porcentaje de valores que no se emplearan en el entreno
    // 5. shuffle: true si queremos en los valores sean barajados
    //6. batchSize: Numero de ejemplos que toma el modelo antes de calcular loss, pesos y bias
    //7. epochs: Nº de entrenos

    const LEARNING_RATE = 0.01; // Choose a learning rate that’s suitable for the data we are using.


  // Compile the model with the defined learning rate and specify a loss function to use.

  model.compile({

    optimizer: tf.train.sgd(LEARNING_RATE),

    loss: 'meanSquaredError'

  });

  //El modelo es entrenado con la función fit, pasandole como parámetros el tensor normalizado y las salidas
 // Finally do the training itself.

 let results = await model.fit(FEATURE_RESULTS.NORMALIZED_VALUES, OUTPUTS_TENSOR, {

    validationSplit: 0.15, // Take aside 15% of the data to use for validation testing.

    shuffle: true,         // Ensure data is shuffled in case it was in an order

    batchSize: 64,         // As we have a lot of training data, batch size is set to 64.

    epochs: 10             // Go over the data 10 times!

  });
  //dispose limpia los tensores
  OUTPUTS_TENSOR.dispose(); 

  FEATURE_RESULTS.NORMALIZED_VALUES.dispose();


  console.log("Average error loss: " + Math.sqrt(results.history.loss[results.history.loss.length - 1]));

  console.log("Average validation error loss: " +   

      Math.sqrt(results.history.val_loss[results.history.val_loss.length - 1]));

    
//Finalmente llamamos a la función de evaluación
  evaluate(); // Once trained evaluate the model.

}

//Para probar el model, le pasamos una casa de tamaño de 
//750m2 y un baño
function evaluate() {

    // Predict answer for a single piece of data.
  
    tf.tidy(function() {

        //Normalizamos la nueva entrada
  
      let newInput = normalize(tf.tensor2d([[750, 1]]), FEATURE_RESULTS.MIN_VALUES, FEATURE_RESULTS.MAX_VALUES);
  
        //Función predict para obtener el resultado final
      let output = model.predict(newInput.NORMALIZED_VALUES);
  
      output.print();
  
    });
  
    
  
    // Finally when you no longer need to make any more predictions,
  
    // clean up the remaining Tensors. 
  
    FEATURE_RESULTS.MIN_VALUES.dispose();
  
    FEATURE_RESULTS.MAX_VALUES.dispose();
  
    model.dispose();
  
    
  //Muestra el numero de tensores en memoria
    console.log(tf.memory().numTensors);
}

/*Gurdar el modelo en el ordenador o en el localStorage:
await model.save('downloads://my-model')
await model.save('localstorage://demo/newModelName)
*/