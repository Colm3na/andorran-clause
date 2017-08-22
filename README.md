# Smart Contract: Pacto Andorrano

## Pacto Andorrano

La finalidad de este Smart Contract es emular el comportamiento de un pacto
andorrano. Este tipo de pactos se utiliza para resolver situaciones de bloqueos
cuando se quiere poner un precio a un bien.

> “El acuerdo consiste en que uno de los socios decide un precio para cada
  acción o participación de la empresa, y se lo ofrece al otro, dejándole un
  plazo para que decida si, por el precio propuesto, prefiere vender sus
  acciones, o por el contrario comprar las acciones del primero.

> Esta fórmula consigue la valoración más objetiva posible, pues es la segunda
  persona la que decide cómo obtener más beneficio, ya sea comprando o
  vendiendo, por lo que a la hora de adjudicar un valor, la persona que decide
  el precio de cada acción está obligada a encontrar el equilibrio.”

## Implementación

Para la ejecución del contrato se definirán las siguientes fases:

1. **Iniciación del pacto**: El interesado en iniciar el pacto llamará a un
método del contrato newPact(). A este método se le pasará:
  - La address de una multisig que se usará para depositar los ethers y los
  tokens de los que se acordará el precio.
  - La address de la persona que decidirá si compra o vende a ese precio.
  - El precio que se fija para los tokens.
2. **Recepción de los fondos**: El contrato estará a la espera de la recepción
desde la address de la multisig. Se debe recibir una cantidad de tokens que
debe ser:
> tokens = precio fijado × ethers

3. **Espera de la decisión**: Se esperará que la persona con la address indicado
en la creación del pacto responda si desea comprar o vender al precio fijado.
4. **Finalización del pacto**: Se realizará la acción procedente para cada caso:
  - **Compra**: Se le envía los ethers introducidos al iniciador del pacto y los
  tokens a la otra persona.
  - **Venta**: Se le envían los tokens al iniciador del pacto y los ethers a la
  otra persona.

## Requisitos

Si la cantidad de tokens que se reciben del multisig no cumple la fórmula
anterior, el pacto falla y se devuelven los fondos.

Si los fondos se reciben de una address que no sea la especificada se ignoran.
Debe ser capaz de trabajar con múltiples pactos de forma simultánea.
