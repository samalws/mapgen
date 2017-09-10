/* removes unnecessary whitespace
*/
function purify(text) {
  var out = "";
  var len = 0;
  for (var char in text) {
    if (text[char] != " ") {
      if (len == 1) {
        out += " ";
      }
      out += text[char];
      len = 0;
    } else {
      len += 1;
    }
  }
  out.replace(new RegExp("&nbsp;&nbsp;&nbsp;&nbsp;", "g"), "\t");
  return out.replace(new RegExp("&nbsp;", "g"), " ");
}

/* parses html string into Python
*/
function parse(string) {
  var str_arr = string.split("\n");
  var out = "";
  for (var str in str_arr) {
    if (str_arr[str].indexOf("<") == -1) {
      out += purify(str_arr[str]);
    } else if (str_arr[str].indexOf("<") > 1) {
      var tokens = str_arr[str].split(new RegExp("<|>", "g"));
      for (var j in tokens) {
        if (tokens[j].indexOf("br") > -1) {
          out += "\n";
        } else if (j % 2 == 0 /* && j != 0*/) {
          out += purify(tokens[j]);
        }
      }
    }
  }
  return out;
}

/* parses Python into html
*/
function anti_parse(code) {

}
