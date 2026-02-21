# Message Bus in UECA-React
#message_bus #communication #events #decouple

## Description
The UECA Message Bus is a centralized communication system in UECA-React that enables decoupled interaction between components. It allows components to post messages to a bus and subscribe to specific message types, promoting a modular and scalable architecture. By using the message bus, components can communicate without direct dependencies, making the application easier to maintain and extend.

---

## API/Methods

### Message Type Declaration
#message_type

To use the message bus, you must first define the message types that your application will use. Message types are declared as a TypeScript type, specifying the input (`in`) and output (`out`) for each message. This ensures type safety when posting and handling messages.

   ```typescript
   type AppMessage = {
     "GetCurrentTime": {     
       out: { time: string };
     };
     "Api.GetWeatherForecast": {
       in: { zip_code: string };
       out: { temperature: number; rainProbability: number };
     };
   };
   ```
- Each message type (e.g., `Api.GetWeatherForecast`) defines:
  - `in`: The input parameters (optional).
  - `out`: The expected output (optional).


### Posting a Message
#post #broadcast #unicast

- **model.bus.broadcast(modelIdFilter, messageType, payload)**  
  Posts a message to the bus for subscribers matching `modelIdFilter` with the specified `messageType` and optional `payload`. This method sends a message to be handled by all subscribers whose `model.fullId()` matches the `modelIdFilter` condition.  
  - **Parameters**:  
    - `modelIdFilter`: A string or RegExp identifying subscriber `model.fullId()` (e.g., `app.ui.screen.nameInput`, `^app\.ui\.screen\.editor\.[a-zA-Z0-9_]+Input$`). Use `undefined`, `null`, or `""` to target all subscribers.
    - `messageType`: A string identifying the message type (e.g., `"UI.Screen.DisableControls"`).  
    - `payload`: An optional object containing data sent with the message.  
  - **Returns**: A Promise that resolves with an array of responses from all message handlers (if any). 

- **model.bus.unicast(messageType, payload)**
  Posts a message to the bus with the specified `messageType` and optional `payload`. This method sends a message to be handled by one subscriber. Note: if multiple subscribers listen for the same message, only the first subscriber will receive it.
  - **Parameters**:  
    - `messageType`: A string identifying the type of message (e.g., `Api.GetWeatherForecast`).  
    - `payload`: An optional object containing data to be sent with the message.  
  - **Returns**: A promise that resolves with the response from the message handler (if any).

- **model.bus.castTo(modelId, messageType, payload)**  
  Posts a message to the bus for the subscriber matching `modelId` with the specified `messageType` and optional `payload`. This method sends a message to be handled by one subscriber whose `model.fullId()` is `modelId`.
  - **Parameters**:
    - `modelId`: A string identifying subscriber `model.fullId()` (e.g., `app.ui.screen.nameInput`).  
    - `messageType`: A string identifying the message type (e.g., `"UI.Screen.ResetControls"`).
    - `payload`: An optional object containing data sent with the message.  
  - **Returns**: A promise that resolves with the response from the message handler (if any).


### Subscribing to Messages
- **messages**  
  A section within the component structure where handlers for specific message types are defined. Each handler is a function that processes the message and can return a response.  
  - **Format**: An object where keys are message types and values are handler functions.  
  - **Handler Signature**: `(payload) => response`, where `payload` is the input data and `response` is a promise wih the output (if applicable).

---

## Registering Message Bus Events
#handlers #subscription

To handle specific message types (i.e., register message bus events), a component must define handlers in its structure. This is done by including a `messages` object within the component's `struct`, where each key is a message type and the value is a handler function that processes the message.

### Steps to Register Message Bus Events
1. **Include Message Type in Component Structure**:  
   Pass the message type (e.g., `AppMessage`) as the second type parameter to `UECA.ComponentStruct` when defining the component's structure. This ensures type safety for both message handlers and message posting.

   ```typescript   
   type ServiceStruct = UECA.ComponentStruct<{}, AppMessage>;
   ```

2. **Define Handlers in `messages`**:  
   Within the `struct`, add the `messages` object and specify handlers for the message types you want to handle. Each handler must match the `in` and `out` types defined in `AppMessage`.

   ```typescript
   const struct: ServiceStruct = {
     messages: {
       "GetCurrentTime": async () => {
         return { time: new Date().toLocaleTimeString() };
       },
     },
   };
   ```

### Key Points
- **Type Safety**: Including the message type in `UECA.ComponentStruct` ensures that handler functions align with the defined message types.
- **Automatic Subscription**: The framework automatically subscribes the component to the message types listed in `messages`; no additional subscription code is required.
- **Async Handlers**: Handlers are asynchronous returning a promise that resolves with the response.

---

## Passing the Message Type to `UECA.ComponentStruct`
#generic_type #typescript

The `UECA.ComponentStruct` generic type is used to define the structure of a component, including its props, events, children, methods, and message handlers. To enable a component to interact with the message bus (either by posting or handling messages), you must pass the application’s message type (e.g., `AppMessage`) as the second type parameter.

### Syntax
```typescript
type ComponentStruct = UECA.ComponentStruct<ComponentStructure, MessageType>;
```
- `ComponentStructure`: The first type parameter defines the component’s structure (e.g., props, events, children, methods).
- `MessageType`: The second type parameter specifies the message type (e.g., `AppMessage`), ensuring type safety for message-related operations.

### Why It’s Required
- **For Handlers**: Ensures the `messages` object’s handlers match the input and output types in `AppMessage`.
- **For Posting**: Allows the bus methods (e.g. `model.bus.unicast`) to enforce correct message types and payloads when sending messages.

### Example Usage
For a component that handles messages:
```typescript
type TimeServiceStruct = UECA.ComponentStruct<{}, AppMessage>;
```

For a component that posts messages:
```typescript
type TimeDisplayStruct = UECA.ComponentStruct<{
  props: { currentTime: string };
  methods: { updateTime: () => void };
}, AppMessage>;
```

---

## Posting Messages
#posting #unicast

To post a message, use the `model.bus.unicast` method (or `model.bus.broadcast`, `model.bus.castTo`), which sends a message to the bus and returns a promise with the handler’s response.

### Example: Posting a Message
```typescript
async function updateTime() {
  const response = await model.bus.unicast("GetCurrentTime");
  model.currentTime = response.time;
}
```

- **Parameters**:  
  - `messageType`: The type of message (e.g., `"GetCurrentTime"`).  
  - `payload`: Optional data matching the `in` type (not needed here since `in` is not requred).  
- **Returns**: A promise resolving to the handler’s response (e.g., `{ time: string }`).

---

## Example: Weather Application
#example #tutorial

This example demonstrates how to register message bus events and pass the message type to `UECA.ComponentStruct` in a weather application with two components: one that handles weather data requests and one that posts them.

### Message Type
```typescript
type AppMessage = {
  "Api.GetWeatherForecast": {
    in: { zip_code: string };
    out: { temperature: number; rainProbability: number };
  };
};
```

### WeatherService Component (Handler)
```typescript
type WeatherServiceStruct = UECA.ComponentStruct<{}, AppMessage>;

function useWeatherService(): UECA.ComponentModel<WeatherServiceStruct> {
  const struct: WeatherServiceStruct = {
    messages: {
      "Api.GetWeatherForecast": async ({ zip_code }) => {
        const response = await fetch(`https://api.weather.com/v3/wx/forecast/daily/5day?postalKey=${zip_code}&format=json`);
        const data = await response.json();
        return { temperature: data.temperature, rainProbability: data.rainProbability };    
      },
    },
  };
  return UECA.useComponent(struct);
}

const WeatherService = UECA.getFC(useWeatherService);
```

### WeatherForm Component (Poster)
```typescript
type WeatherFormStruct = UECA.ComponentStruct<{
  props: { 
    zip_code: string;
    weatherData: { 
      temperature: number;
      rainProbability: number 
    }
  };
  methods: { 
    submitForm: () => void
  };
}, AppMessage>;

function useWeatherForm(): UECA.ComponentModel<WeatherFormStruct> {
  const struct: WeatherFormStruct = {
    props: {
      zip_code: "",
      weatherData: undefined
    },
    methods: {
      submitForm: async () => {
        model.weatherData = await model.bus.unicast("Api.GetWeatherForecast", {zip_code: model.zip_code });
      },
    },
    View: () => (
      <div id={model.htmlId()}>
        <input value={model.zip_code} onChange={(e) => model.zip_code = e.target.value} placeholder="Zip Code" />        
        <button onClick={model.submitForm}>Get Weather</button>
        {model.weatherData && (
          <p>Temperature: {model.weatherData.temperature}°C, Rain Probability: {model.weatherData.rainProbability}%</p>
        )}
      </div>
    ),
  };
  return UECA.useComponent(struct);
}

const WeatherForm = UECA.getFC(useWeatherForm);
```

### Integrating in the App
```typescript
function App() {
  return (
    <div>
      <WeatherForm />
      <WeatherService />
    </div>
  );
}
```

**Explanation**:
- **Message Type**: `AppMessage` defines `"Api.GetWeatherForecast"` with input (`zip_code`) and output (`temperature`, `rainProbability`).
- **Handler Registration**: `WeatherService` registers a handler for `"Api.GetWeatherForecast"` in its `messages` object.
- **Type Passing**: Both components pass `AppMessage` to `UECA.ComponentStruct` for type safety.
- **Posting**: `WeatherForm` uses `model.bus.unicast` to request weather data, updating its display with the response.

---

## Best Practices
- **Use Clear Message Names**: Choose descriptive names (e.g., `"Api.GetWeatherForecast"`) to indicate purpose.
- **Handle Errors**: Implement error handling in asynchronous handlers or configure the global error handler `globalSettings.errorHandler` to handle all application errors in one place (e.g. write to the log, pop up a message, etc.).
- **Keep Payloads Minimal**: Only include necessary data in the message payload.
- **Centralize Message Types**: Define all message types in a single file for consistency.

---

## Notes
- The message bus routes messages to the handler registered for the message type.
- Only one component should handle a specific message type to avoid conflicts (unless it's a broadcast message).
- Components interacting with the message bus (posting or handling) must include the message type in their structure.