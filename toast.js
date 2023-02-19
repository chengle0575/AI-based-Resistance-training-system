import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export function toast(text, durationInMs = 3000) {
  Toastify({
    text: text,
    duration: durationInMs,
    position:"center",
    offset: {
    //  x: 150, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 500 // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    style: {
      background: "linear-gradient(to right, #F0AF12, #FFD264)",
      color:"black",
      
      
    }
  }).showToast();
}
