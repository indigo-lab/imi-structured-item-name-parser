const parse = require('../main').parse;
const expect = require('chai').expect;

describe('imi-structured-item-name-parser', function() {
  describe('構造化項目名のパース機能', function() {
    it('正常なクラス定義をエラーなくパースできること', function() {
      expect(parse("*ex:Animal"))
        .deep.equal(parse(" * ex:Animal "))
        .deep.equal({
          "name": "Animal",
          "prefix": "ex",
          "key": true
        });
    });
    it('異常なクラス定義(数字はじまりの名称)が文法エラーを投げること', function() {
      expect(function() {
        return parse("*ex:8Man");
      }).to.throw();
    });

    it('先頭の空白が無視されること', function() {
      expect(parse(" hello>world")).deep.equal({
        "name": "hello",
        "next": {
          "name": "world"
        }
      });
    });
    it('末尾の空白が無視されること', function() {
      expect(parse("hello>world ")).deep.equal({
        "name": "hello",
        "next": {
          "name": "world"
        }
      });
    });
    it('中間の空白が無視されること', function() {
      expect(parse("  hello  >  world ")).deep.equal({
        "name": "hello",
        "next": {
          "name": "world"
        }
      });
    });

    it('散在する空白が無視されること', function() {
      expect(parse(" * Human { @Animal } > say [ daddy ]  { volume = 'loud' } @ja > ")).deep.equal({
        "name": "Human",
        "restriction": [{
          "name": "Animal"
        }],
        "next": {
          "name": "say",
          "restriction": [{
            "name": "volume",
            "value": "loud"
          }],
          "key": true,
          "language": "ja",
          "delimiter": true,
          "group": " daddy "
        }
      });
    });

    it('深さ1の構造化項目名をパースできること', function() {
      expect(parse("*名称")).deep.equal({
        "name": "名称",
        "key": true
      });
    });
    it('深さ2の構造化項目名をパースできること', function() {
      expect(parse("名称>表記")).deep.equal({
        "name": "名称",
        "next": {
          "name": "表記"
        }
      });
    });
    it('深さ3の構造化項目名をパースできること', function() {
      expect(parse("場所>名称>表記")).deep.equal({
        "name": "場所",
        "next": {
          "name": "名称",
          "next": {
            "name": "表記"
          }
        }
      });
    });
    it('ルートクラスへのプライマリーキー指定をパースできること', function() {
      expect(parse("*場所")).deep.equal({
        "name": "場所",
        "key": true
      });
    });
    it('プロパティへのプライマリーキー指定をパースできること', function() {
      expect(parse("*連絡先>Eメールアドレス")).deep.equal({
        "name": "連絡先",
        "next": {
          "name": "Eメールアドレス",
          "key": true
        }
      });
    });
    it('末端のプロパティへのグループ指定をパースできること', function() {
      expect(parse("名称>表記[通称]")).deep.equal({
        "name": "名称",
        "next": {
          "name": "表記",
          "group": "通称"
        }
      });
    });

    it('中間のプロパティへのグループ指定をパースできること', function() {
      expect(parse("場所>名称[通称]>表記")).deep.equal({
        "name": "場所",
        "next": {
          "group": "通称",
          "name": "名称",
          "next": {
            "name": "表記"
          }
        }
      });
    });

    it('クラスへのグループ指定をパースできること', function() {
      expect(parse("名称[匿名]>表記")).deep.equal({
        "name": "名称",
        "group": "匿名",
        "next": {
          "name": "表記"
        }
      });
    });
    it('末端のプロパティへの言語タグをパースできること', function() {
      expect(parse("名称>表記@ja")).deep.equal({
        "name": "名称",
        "next": {
          "name": "表記",
          "language": "ja"
        }
      });
    });
    it('中間のプロパティに付与された言語タグが文法エラーとなること', function() {
      expect(function() {
        return parse("場所>名称@ja>表記");
      }).to.throw();
    });
    it('クラスに付与された言語タグが文法エラーとなること', function() {
      expect(function() {
        return parse("名称@ja");
      }).to.throw();
    });
    it('言語タグとグループを併用しても正しくパースできること', function() {
      expect(parse("名称>表記[英語名]@en")).deep.equal({
        "name": "名称",
        "next": {
          "name": "表記",
          "language": "en",
          "group": "英語名"
        }
      });
    });
    it('プロパティに対するURI指定子が正しくパースできること', function() {
      expect(parse("場所>地理識別子>")).deep.equal({
        "name": "場所",
        "next": {
          "delimiter": true,
          "name": "地理識別子"
        }
      });
    });
    it('クラスに対するURI指定子が正しくパースできること', function() {
      expect(function() {
        return parse("場所>");
      }).to.throw();
    });
    it('URI指定子とグループの併用が正しくパースできること', function() {
      expect(parse("場所>地理識別子[GeoNames]>")).deep.equal({
        "name": "場所",
        "next": {
          "delimiter": true,
          "name": "地理識別子",
          "group": "GeoNames"
        }
      });
    });

    it("末端のプロパティへの固定値制約の単独指定が正しくパースできること", function() {
      expect(parse("A>B{a='b'}")).deep.equal({
        "name": "A",
        "next": {
          "name": "B",
          "restriction": [{
            "name": "a",
            "value": "b"
          }]
        }
      });
    });
    it("末端のプロパティへの固定値制約の複数指定が正しくパースできること", function() {
      expect(parse("A>B{a='b'}{c='d'}")).deep.equal({
        "name": "A",
        "next": {
          "name": "B",
          "restriction": [{
            "name": "a",
            "value": "b"
          }, {
            "name": "c",
            "value": "d"
          }]
        }
      });
    });
    it("中間のプロパティへの固定値制約の単数指定が正しくパースできること", function() {
      expect(parse("A>B{a='b'}>C")).deep.equal({
        "name": "A",
        "next": {
          "name": "B",
          "restriction": [{
            "name": "a",
            "value": "b"
          }],
          "next": {
            "name": "C"
          }
        }
      });
    });
    it("中間のプロパティへの固定値制約の複数指定が正しくパースできること", function() {
      expect(parse("A>B{a='b'}{c='d'}>C")).deep.equal({
        "name": "A",
        "next": {
          "name": "B",
          "restriction": [{
            "name": "a",
            "value": "b"
          }, {
            "name": "c",
            "value": "d"
          }],
          "next": {
            "name": "C"
          }
        }
      });
    });
    it("クラス、中間、末端のプロパティへの固定値制約が正しくパースできること", function() {
      expect(parse("A{a='x'}>B{b='y'}>C{c='z'}")).deep.equal({
        "name": "A",
        "restriction": [{
          "name": "a",
          "value": "x"
        }],
        "next": {
          "name": "B",
          "restriction": [{
            "name": "b",
            "value": "y"
          }],
          "next": {
            "name": "C",
            "restriction": [{
              "name": "c",
              "value": "z"
            }],
          }
        }
      });
    });
    it('末端のプロパティへの型制約が正しくパースできること', function() {
      expect(parse("重量>数値{@xsd:nonNegativeInteger}")).deep.equal({
        "name": "重量",
        "next": {
          "name": "数値",
          "restriction": [{
            "name": "nonNegativeInteger",
            "prefix": "xsd"
          }]
        }
      });
    });
    it('中間のプロパティへの型制約が正しくパースできること', function() {
      expect(parse("関与>関与者{@人}>氏名>姓名")).deep.equal({
        "name": "関与",
        "next": {
          "name": "関与者",
          "restriction": [{
            "name": "人"
          }],
          "next": {
            "name": "氏名",
            "next": {
              "name": "姓名"
            }
          }
        }
      });
    });
  });
});
