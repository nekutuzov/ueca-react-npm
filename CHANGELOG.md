# Changelog

## v2.0.4

 - UECA-REACT 2.0 initial release 
 
## v2.0.5

 - npm audit fix (7 vulnerabilities fixed)  
  - Readme updates (links, new demo app)

## v2.0.6

- All internal private members of the model now have a preffix "__$ueca$" to avoid collision with component structure members in the user's code.
- Bugfixes and improvements for chaininig sync/asysc event handlers and methods. In v2.0.5 chained functions always returned a promise.
  The logic is adaptive now. Chained sync functions return a value and async chained functions return a promise.
- Small readme updates.