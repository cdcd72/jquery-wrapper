# jQuery Wrapper

一個扔掉 jQuery 包袱的包裝器！  
A wrapper that throws away the jQuery baggage!

## Implemented function list

- Operation
  - each
  - find
  - show
  - hide
  - insertAdjacent (extended)
  - before
  - after
  - val
  - width
  - height
  - append
  - remove
  - eq
  - camelCase (extended)
  - css
  - offset
  - attr
  - prop
- Event
  - ready
  - on
  - off
  - keypress
- Ajax
  - $.ajax 
  - $.get
  - $.post
  - $.send (extended)

usage scenario

## Usage

1. Get `JQueryWrapper.js` from src directory, then include your project.
2. Use something like jQuery

   ```
   $(selector).xyz() // xyz mean implemented function.
   ```

## Why?

If your project no longer needs to use jQuery, but you don't want to affect the original behavior situation.
  
## Contribute & Bug report

Please open up an issue on GitHub before you put a lot efforts on pull request.

## License

MIT license
