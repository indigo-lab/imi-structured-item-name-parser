// [2017-10-16] 仕様としての修正点は報告した。現仕様に準拠したもっとも寛容なパーサを実装する方針。

// 【ユーティリティ エントリポイント】
// 文末の空白を許可
start = a:statement WS { return a;}

// 【構造化項目名】
statement
  = WS a:key? b:class c:property+ WS d:language? WS e:linker? {
    var tail = b;
    c.forEach(function(v){
      tail.next = v;
      tail = tail.next;
    });
    if(a) tail.key = true;
    if(d) tail.language = d;
    if(e) tail.delimiter = true;
    return b;
  }
  / WS a:key b:class {
    b.key = true;
    return b;
  }

// 【ユーティリティ prefixedName】
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
// QName の空白は仕様検討課題として報告
prefixedName
  = WS a:prefix? WS b:identifier {
    var obj = {
      name : b
    };
    if(a) obj.prefix = a;
    return obj;
  }

// 【クラス項目】
// 文頭候補、文頭の空白は許可
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
class
  = WS a:prefixedName WS b:group? c:restriction* {
    if(b) a.group = b;
    if(c && c.length > 0) a.restriction = c;
    return a;
  }

// 【名前空間プレフィックス指定子】
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
// QName の空白は仕様検討課題として報告
prefix = WS a:identifier WS ":" {return a;}

// 【グループ指定子】
// 先行するクラス・プロパティ名との間に余白をいれたいケース
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
group = WS a:groupLiteral {return a;}

// 【組込み制約】
// 制約の前と中身を余裕を持って書きたいケース
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
restriction = WS "{" a:(value/type) WS "}" {return a;}

// 【固定値制約】
// 代入式を余裕を持って書きたいケース
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
value
  = WS a:prefixedName WS "=" WS b:quotedLiteral {
    a.value = b;
    return a;
  }

// 【型制約】
// 先頭の余白は固定値制約同様
// [2017-10-16] @ と 型名の間は空白を入れてレイアウトすることを意図している
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
type
  = WS "@" WS a:prefixedName {
    return a;
  }

// 【プロパティ項目】
// 先行するクラス、プロパティ名との境界に余白を入れたいケース
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
property
  = WS ">" WS a:prefixedName WS b:group? c:restriction* {
    if(b) a.group = b;
    if(c && c.length > 0) a.restriction = c;
    return a;
  }

// 【主キー指定子】
// 文頭候補、文頭に空白があることはありうる
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
key = WS "*"

// 【URL変換子】
// 先行するクラス、プロパティ名との境界に余白を入れたいケース
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
linker = WS ">"

// 【言語指定句】
// 先頭の余白は通常対応、ただし、@ と 言語名の間は疑問
// 言語名は識別子。識別子は言語タグを包含するので問題はないのだが。
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
language = WS "@" WS a:identifier {return a;}

// 【文字列リテラル】
// [2017-10-16] 構文規則由来であり、空白許容ルールを導入
quotedLiteral = WS a:(singleQuotedLiteral / doubleQuotedLiteral) {return a;}

// 【二重引用符文字列リテラル】
doubleQuotedLiteral = '"' chars:(doubleQuoteEscape / [^"])* '"' {return chars.join("");}

// 【二重引用符エスケープ】
doubleQuoteEscape = '\\"' {return '"';}

// 【一重引用符文字列リテラル】
singleQuotedLiteral = "'" chars:(singleQuoteEscape / [^'])* "'" {return chars.join("");}

// 【一重引用符エスケープ】
singleQuoteEscape = "\\'" {return "'";}

// 【グループ名リテラル】
groupLiteral = "[" a:[^\]]+ "]" {return a.join("");}

// 【識別子】
identifier =
  head:identifierHeadCharacter
  body:identifierBodyCharacter*
  {return head + (body ? body.join("") : "");}

// 【識別子先頭文字】
identifierHeadCharacter =
  (
    [A-Z] /
    [_] /
    [a-z] /
    [\u00C0-\u00D6] /
    [\u00D8-\u00F6] /
    [\u00F8-\u02FF] /
    [\u0370-\u037D] /
    [\u037F-\u1FFF] /
    [\u200C-\u200D] /
    [\u2070-\u218F] /
    [\u2C00-\u2FEF] /
    [\u3001-\uD7FF] /
    [\uF900-\uFDCF] /
    [\uFDF0-\uFFFD]
  )

// 【識別子文字】
identifierBodyCharacter =
  (
    identifierHeadCharacter /
    [\-] /
    [.] /
    [0-9] /
    [\u00B7] /
    [\u0300-\u036f] /
    [\u203f-\u2040]
  )

// 【空白文字】
s = [ \t\r\n\f]+

// 【ユーティリティ 省略可能な空白文字】
WS = s?
