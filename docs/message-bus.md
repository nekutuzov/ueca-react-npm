# UECA Message Bus

In Unified Encapsulated Component Architecture (UECA), the messaging system plays a crucial role in enabling components to communicate in a decoupled manner. This section will provide an overview of the messaging system, including the message type declaration and a simple example of messaging usage.

## What is the Messaging System?

The messaging system in UECA allows components to send and receive messages without direct dependencies. This promotes a modular architecture where components can interact seamlessly, enhancing maintainability and scalability. Components can post messages to the message bus and subscribe to handle specific messages, facilitating communication across different parts of the application.

## Message Type Declaration

To use the messaging system, you first need to declare the message types. This declaration specifies the structure of the messages, including the input parameters and the output data.

### Example Message Type Declaration

```typescript
// Application Messages: "message-type": { in: <parameter-type>, out: <parameter-type> }
// Properties "in" and "out" describe value type of input and output parameters.
// Both properties "in" and "out" are optional

type AppMessage = {
  "Api.GetWeatherForecast": {
    in: { zip_code: string; date: Date };
    out: { temperature: number; rainProbability: number };
  };
};
```

In this example, the `AppMessage` type defines a message `Api.GetWeatherForecast` with input parameters `zip_code` and `date`, and output data `temperature` and `rainProbability`.

## Using the Messaging System

To use the messaging system, follow these steps:

1. **Define the Message Types**: Declare the structure of the messages as shown above.
2. **Subscribe to Messages**: Use the message bus to subscribe to specific messages in the components that need to handle them.
3. **Post Messages**: Send messages to the bus from components that need to trigger actions in other components.

### Example: WeatherForm and WeatherService Components

Let's walk through a simple example where a `WeatherForm` component sends a message to request weather data, and a `WeatherService` component handles the message and retrieves the data.

### WeatherForm Component

The `WeatherForm` component sends a message to request weather data.

```typescript
import * as UEC from "ueca-react";

type WeatherFormStruct = UEC.ComponentStruct<{
  children: {
    zipcodeInputModel: MyInputModel;
    dateInputModel: MyInputModel;
    submitButtonModel: MyButtonModel;
    weatherDisplayModel: WeatherDisplayModel;
  };
}, AppMessage>;

type WeatherFormParams = UEC.ComponentParams<WeatherFormStruct, AppMessage>;
type WeatherFormModel = UEC.ComponentModel<WeatherFormStruct, AppMessage>;

function useWeatherForm(params?: WeatherFormParams): WeatherFormModel {
  const struct: WeatherFormStruct = {    
    children: {
      zipcodeInputModel: useMyInput({ placeholder: "Zip Code" }),

      dateInputModel: useMyInput({ placeholder: "Date" }),

      submitButtonModel: useMyButton({
        caption: "Submit",
        onClick: async () => {
          await _handleSubmit();
        },
      }),

      weatherDisplayModel: useWeatherDisplay(),
    },

    View: () => (
      <div>
        <div>
          <label>Zip Code:</label>
          <model.zipcodeInputModel.View />
        </div>
        <div>
          <label>Date:</label>
          <model.dateInputModel.View />
        </div>
        <div>
          <model.submitButtonModel.View />
        </div>
        <model.weatherDisplayModel.View />
      </div>
    ),
  };

  const model: WeatherFormModel = UEC.useComponent(struct, params);
  return model;

  // Private methods
  async function _handleSubmit() {
    model.weatherDisplayModel.data = await model.bus.getAsync(
      "Api.GetWeatherForecast",
      {
        zip_code: model.zipcodeInputModel.value,
        date: new Date(model.dateInputModel.value),
      }
    );
  } 
}

const WeatherForm = UEC.getFC(useWeatherForm);

export { WeatherFormModel, useWeatherForm, WeatherForm };
```

### WeatherService Component

The `WeatherService` component subscribes to the message and handles the data retrieval.

```typescript
import * as UEC from "ueca-react";

// Service Component Structure
type WeatherServiceStruct = UEC.ComponentStruct<{}, AppMessage>;

type WeatherServiceParams = UEC.ComponentParams<WeatherServiceStruct, AppMessage>;
type WeatherServiceModel = UEC.ComponentModel<WeatherServiceStruct, AppMessage>;

function useWeatherService(params?: WeatherServiceParams): WeatherServiceModel {
  const struct: WeatherServiceStruct = {    
    messages: {
      "Api.GetWeatherForecast": async ({ zip_code, date }) => {
        const response = await fetch(`https://api.weather.com/v3/wx/forecast/daily/5day?postalKey=${zip_code}&format=json`);
        const data = await response.json();

        return {
          temperature: data.temperature,
          rainProbability: data.rainProbability,
        };
      },
    }
  };

  const model: WeatherServiceModel = UEC.useComponent(struct, params);
  return model;
}

const WeatherService = UEC.getFC(useWeatherService);

export { WeatherServiceModel, useWeatherService, WeatherService };
```

### Integration in the App

Integrate the `WeatherForm` and `WeatherService` components in the main application.

```typescript
import * as React from "react";
import { WeatherForm } from "./WeatherForm";
import { WeatherService } from "./WeatherService";

function App() {
  return (
    <div>
      <h1>UECA Messaging System Example</h1>
      <WeatherForm />
      <WeatherService />
    </div>
  );
}

export default App;
```

## Conclusion

The UECA messaging system facilitates decoupled communication between components, promoting a modular and maintainable architecture. By defining message types, subscribing to messages, and posting messages, you can create a flexible communication system within your UECA application. This overview and example demonstrate the basic usage of the messaging system, enabling you to integrate it into your projects effectively.
