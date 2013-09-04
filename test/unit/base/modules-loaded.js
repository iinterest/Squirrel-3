//module("模块集成测试");

test("核心", function() {
    notEqual(typeof SQ.core, "undefined", "core 已集成");
    notEqual(typeof SQ.dom, "undefined", "dom 已集成");
    notEqual(typeof SQ.store, "undefined", "store 已集成");
    notEqual(typeof SQ.ua, "undefined", "ua 已集成");
    notEqual(typeof SQ.util, "undefined", "util 已集成");
});

test("插件", function() {
    notEqual(typeof SQ.Button, "undefined", "Button 已集成");
    notEqual(typeof SQ.LoadMore, "undefined", "LoadMore 已集成");
    notEqual(typeof SQ.Suggest, "undefined", "Suggest 已集成");
    notEqual(typeof SQ.Tabs, "undefined", "Tabs 已集成");
    notEqual(typeof SQ.TouchSlip, "undefined", "TouchSlip 已集成");
});

test("插件样式", function() {
    
});
console.log($(".sq-btn").css("min-width"));

/*
module("Test");

test( "a test", function() {
    notEqual(typeof SQ.Hello, "undefined", "Button 已集成");
});*/
