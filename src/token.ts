import { BTree } from './btree'

export function tokIsKeyword(t :token) :bool {
  return token.keyword_beg < t && t < token.keyword_end
}

export function hasIntValue(t :token) :bool {
  return t == token.CHAR
}

export function hasByteValue(t :token) :bool {
  return (
    (token.literal_beg < t && t < token.literal_end) ||
    t == token.COMMENT
  )
}

export function tokstr(t :token) :string {
  return tokenStrings.get(t) || token[t].toLowerCase()
}

// Operator precedences
export enum prec {
  LOWEST, // = := ! <- ->
  OROR,     // ||
  ANDAND,    // &&
  CMP,    // == != < <= > >=
  ADD,    // + - | ^
  MUL,    // * / % & &^ << >>
}

export enum token {
  // Special tokens
  ILLEGAL = 0,
  EOF,
  COMMENT,

  literal_beg,
  // Identifiers and basic type literals
  // (these tokens stand for classes of literals)
  NAME,    // main
  NAMEAT,  // @foo, @
  literal_basic_beg,
  literal_int_beg,
  INT,     // 12345
  INT_BIN, // 0b1010
  INT_OCT, // 0o6737
  INT_HEX, // 0xBE3f
  literal_int_end,
  FLOAT,   // 123.45
  CHAR,    // 'a'
  // RATIO,   // 22/7
  literal_basic_end,
  STRING,  // "abc"
  STRING_MULTI, // "ab\nc" — multi-line
  STRING_PIECE, // "a ${...} b" -- the "a " part (" b" is STRING)
  literal_end,

  // Delimiters
  delim_beg,
  LPAREN,    // (
  LBRACKET,  // [
  LBRACE,    // {
  COMMA,     // ,
  DOT,       // .
  PERIODS,   // ..
  ELLIPSIS,  // ...
  RPAREN,    // )
  RBRACKET,  // ]
  RBRACE,    // }
  SEMICOLON, // ;
  COLON,     // :
  delim_end,

  // Operators
  operator_beg,

  // prec.LOWEST
  ASSIGN,         // =
  assignop_beg,
  ADD_ASSIGN,     // +=
  SUB_ASSIGN,     // -=
  MUL_ASSIGN,     // *=
  QUO_ASSIGN,     // /=
  REM_ASSIGN,     // %=
  AND_ASSIGN,     // &=
  OR_ASSIGN,      // |=
  XOR_ASSIGN,     // ^=
  SHL_ASSIGN,     // <<=
  SHR_ASSIGN,     // >>=
  AND_NOT_ASSIGN, // &^=
  assignop_end,
  INC,            // ++
  DEC,            // --
  SET_ASSIGN,     // :=
  NOT,            // !
  ARROWL,         // <-
  ARROWR,         // ->

  cmpop_beg,
  // prec.OR
  OROR, // ||
  
  // prec.AND
  ANDAND, // &&

  // prec.CMP
  EQL, // ==
  NEQ, // !=
  LSS, // <
  LEQ, // <=
  GTR, // >
  GEQ, // >=
  cmpop_end,

  // prec.ADD
  ADD, // +
  SUB, // -
  OR,  // |
  XOR, // ^  "NOT" when unary, "XOR" when binary
  
  // prec.MUL
  MUL,     // *
  QUO,     // /
  REM,     // %
  AND,     // &
  AND_NOT, // &^  equiv to `x & (^y)` (or `x & ~y` in C)
  SHL,     // <<
  SHR,     // >>  (arithmetic when signed, logical when unsigned)

  operator_end,

  // Keywords
  keyword_beg,
  BREAK,
  //CASE,
  //CHAN,
  //CONST,
  CONTINUE,
  DEFAULT,
  DEFER,
  ELSE,
  ENUM,
  FALLTHROUGH,
  FOR,
  FUN,
  GO,
  //GOTO,
  IF,
  IMPORT,
  INTERFACE,
  IN,
  //MAP,
  //PACKAGE,
  //RANGE,
  RETURN,
  SELECT,
  //STRUCT,
  SWITCH,
  SYMBOL,
  TYPE,
  // VAR,
  WHILE,
  keyword_end,
} // enum T


// Keywords
// When you add, change or remove a keyword, make sure to run gen-btree.js
// with the changes and update the code below.
// Keyword token names should be the UPPER-CASE version of the actual keyword
// name. This convention is used to populate tokenStrings.


const tokenStrings = new Map<token, string>([
  [token.NAMEAT, "@"],

  [token.ADD, "+"],
  [token.SUB, "-"],
  [token.MUL, "*"],
  [token.QUO, "/"],
  [token.REM, "%"],

  [token.AND,     "&"],
  [token.OR,      "|"],
  [token.XOR,     "^"],
  [token.SHL,     "<<"],
  [token.SHR,     ">>"],
  [token.AND_NOT, "&^"],

  [token.ADD_ASSIGN, "+="],
  [token.SUB_ASSIGN, "-="],
  [token.MUL_ASSIGN, "*="],
  [token.QUO_ASSIGN, "/="],
  [token.REM_ASSIGN, "%="],

  [token.AND_ASSIGN,     "&="],
  [token.OR_ASSIGN,      "|="],
  [token.XOR_ASSIGN,     "^="],
  [token.SHL_ASSIGN,     "<<="],
  [token.SHR_ASSIGN,     ">>="],
  [token.AND_NOT_ASSIGN, "&^="],

  [token.ANDAND, "&&"],
  [token.OROR,   "||"],
  [token.ARROWL, "<-"],
  [token.ARROWR, "->"],
  [token.INC,    "++"],
  [token.DEC,    "--"],

  [token.EQL,    "=="],
  [token.LSS,    "<"],
  [token.GTR,    ">"],
  [token.ASSIGN, "="],
  [token.NOT,    "!"],

  [token.NEQ,        "!="],
  [token.LEQ,        "<="],
  [token.GEQ,        ">="],
  [token.SET_ASSIGN, ":="],
  [token.ELLIPSIS,   "..."],
  [token.PERIODS,    ".."],

  [token.LPAREN,   "("],
  [token.LBRACKET, "["],
  [token.LBRACE,   "{"],
  [token.COMMA,    ","],
  [token.DOT,      "."],

  [token.RPAREN,    ")"],
  [token.RBRACKET,  "]"],
  [token.RBRACE,    "}"],
  [token.SEMICOLON, ";"],
  [token.COLON,     ":"],
]) // tokenStrings

for (let i = token.keyword_beg+1; i < token.keyword_end; ++i) {
  const t = token[i] as string
  tokenStrings.set((token as any)[t] as token, t.toLowerCase())
}

// BEGIN generated by gen-keywords.js
const cdat = new Uint8Array([
  103,111,100,101,102,101,114,98,114,101,97,107,99,111,110,116,105,110,117,101
  ,100,101,102,97,117,108,116,101,110,117,109,101,108,115,101,102,97,108,108
  ,116,104,114,111,117,103,104,102,111,114,102,117,110,114,101,116,117,114,110
  ,105,109,112,111,114,116,105,102,105,110,105,110,116,101,114,102,97,99,101
  ,115,119,105,116,99,104,115,101,108,101,99,116,115,121,109,98,111,108,116
  ,121,112,101,119,104,105,108,101]);
const keywords = new BTree<token>(
  { k: cdat.subarray(0,2) /*go*/, v: token.GO,
    L:{ k: cdat.subarray(2,7) /*defer*/, v: token.DEFER,
      L:{ k: cdat.subarray(7,12) /*break*/, v: token.BREAK,
        R:{ k: cdat.subarray(12,20) /*continue*/, v: token.CONTINUE,
          R:{ k: cdat.subarray(20,27) /*default*/, v: token.DEFAULT}}},
      R:{ k: cdat.subarray(27,31) /*enum*/, v: token.ENUM,
        L:{ k: cdat.subarray(31,35) /*else*/, v: token.ELSE},
        R:{ k: cdat.subarray(35,46) /*fallthrough*/, v: token.FALLTHROUGH,
          R:{ k: cdat.subarray(46,49) /*for*/, v: token.FOR,
            R:{ k: cdat.subarray(49,52) /*fun*/, v: token.FUN}}}}},
    R:{ k: cdat.subarray(52,58) /*return*/, v: token.RETURN,
      L:{ k: cdat.subarray(58,64) /*import*/, v: token.IMPORT,
        L:{ k: cdat.subarray(64,66) /*if*/, v: token.IF},
        R:{ k: cdat.subarray(66,68) /*in*/, v: token.IN,
          R:{ k: cdat.subarray(68,77) /*interface*/, v: token.INTERFACE}}},
      R:{ k: cdat.subarray(77,83) /*switch*/, v: token.SWITCH,
        L:{ k: cdat.subarray(83,89) /*select*/, v: token.SELECT},
        R:{ k: cdat.subarray(89,95) /*symbol*/, v: token.SYMBOL,
          R:{ k: cdat.subarray(95,99) /*type*/, v: token.TYPE,
            R:{ k: cdat.subarray(99,104) /*while*/, v: token.WHILE}}}}}}
)
// END generated by gen-keywords.js

// lookupKeyword maps an identifier to its keyword token or NAME
// (if not a keyword).
//
export function lookupKeyword(ident :ArrayLike<byte>) :token {
  return keywords.get(ident) || token.NAME
}
