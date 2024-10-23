export const splitX = (val) => {
  let splitArr = [];

  console.log("They Valllll", val);

  for (let i = val.length - 1; i >= 0; i--) {
    //cases
    if (val[i] == ",") {
      splitArr.length = 0;
    }
    if (val[i] == " ") {
      splitArr.length = 0;
    }
    if (val[i] == "-") {
      splitArr.length = 0;
    }
    console.log("Myy Index", i);
    //logic
    if (val[i] != "X") {
      console.log("Not Val[i]", val[i], i);

      if (val[i] != "," && val[i] != " " && val[i] != "-") {
        splitArr.push(val[i]);
      }
    } else {
      console.log("Val[i]", val[i], i);

      if (splitArr.length >= 8) {
        return splitArr.reverse().join("");
      } else {
        if (val[i] == "X" && !(splitArr.length >= 8)) {
            console.log("splitArrrrr", splitArr)
          splitArr.push("X");
        } 
      }
    }
  }

  return splitArr.reverse().join("");
};
