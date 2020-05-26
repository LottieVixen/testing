const indicatorBlock = extendContent(Wall, "indicator-wall", {
    setBars() {
        this.super$setBars();
        this.bars.add("dtl10f", func(entity => new Bar(
            prov(()=>"DmgTkenLast10Frames: " + Strings.fixed(entity.dps(), 2)),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
        this.bars.add("dps", func(entity => new Bar(
            prov(()=>"DPS: " + Strings.fixed(entity.dps(), 2) + "/s"),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
    },
});
indicatorBlock.entityType = prov(()=>extend(TileEntity, {
    _labels: [],
    _i: 0,
    _window: new WindowedMean(10),
    _window2: new WindowedMean(60),
    _dps: 0,
    _dps2: 0,
    iIncrement(value){
        this._i = value;
    },
    dps(){
        return this._dps;
    },
    dps10(){
        return this._dps2;
    },
    damage(damage){
        this.iIncrement(damage);
    },
    updateDps() {
        if(!this._window2.hasEnoughData()) return;
        var val = this._window2.getWindowValues().slice(3, 57);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._dps = m/val.length;
        delete val, m;
        if(!this._window.hasEnoughData()) return;
        var val = this._window.getWindowValues().slice(1, 4);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._dps2 = m/val.length;
    },
    update() {
        this.super$update();
        this._window.addValue(this._i);
        this._window2.addValue(this._i);
        this._i = 0;
        this.updateDps();
    }
}));

indicatorBlock.health = 1;
indicatorBlock.buildVisibility = BuildVisibility.sandboxOnly;
indicatorBlock.requirements = [new ItemStack(Items.copper, 1)];
indicatorBlock.size = 1;
indicatorBlock.update = true;
indicatorBlock.localizedName = "Indicator block";
indicatorBlock.description = "Displays damage.";

//quezler's throughput ported to 5.0
const throughputVoid = extendContent(ItemVoid, "throughput-void", {
    setBars() {
        this.super$setBars();
        this.bars.add("throughput", func(entity => new Bar(
            prov(()=>"Throughput: " + Strings.fixed(entity.throughput(), 2) + "/s"),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
    },
    handleItem(item, tile, source) {
        tile.entity.iIncrement();
    }
});
throughputVoid.entityType = prov(ent => extend(TileEntity, {
    _i: 0,
    _window: new WindowedMean(60*10),
    _throughput: 0,
    iIncrement() {
        this._i++;
    },
    throughput() {
        return this._throughput;
    },
    updateThroughput() {
        if(!this._window.hasEnoughData()) return;
        var val = this._window.getWindowValues().slice(30, 570);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._throughput = m/val.length;
    },
    update() {
        this.super$update();
        this._window.addValue(this._i * (60 * Time.delta()));
        this._i = 0;
        this.updateThroughput();
    }
}));
const liquidThroughputVoid = extendContent(LiquidVoid, "liquid-throughput-void", {
    setBars() {
        this.super$setBars();
        this.bars.add("throughput", func(entity => new Bar(
            prov(()=>"Throughput: " + Strings.fixed(entity.throughput(), 2) + "/s"),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
    },
    handleLiquid(tile, source, liquid, amount) {
        tile.entity.iIncrement(amount);
    }
});
liquidThroughputVoid.entityType = prov(ent => extend(TileEntity, {
    _i: 0,
    _window: new WindowedMean(60*10),
    _throughput: 0,
    iIncrement(value) {
        this._i+=value;
    },
    throughput() {
        return this._throughput;
    },
    updateThroughput() {
        if(!this._window.hasEnoughData()) return;
        var val = this._window.getWindowValues().slice(30, 570);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._throughput = m/val.length;
    },
    update() {
        this.super$update();
        this._window.addValue(this._i * (60 / Time.delta()));
        this._i = 0;
        this.updateThroughput();
    }
}));

liquidThroughputVoid.health = 1;
liquidThroughputVoid.buildVisibility = BuildVisibility.sandboxOnly;
liquidThroughputVoid.requirements = [new ItemStack(Items.copper, 1)];
liquidThroughputVoid.size = 1;
liquidThroughputVoid.update = true;
liquidThroughputVoid.localizedName = "Liquid display void";
liquidThroughputVoid.description = "Displays throughput.";

throughputVoid.health = 1;
throughputVoid.buildVisibility = BuildVisibility.sandboxOnly;
throughputVoid.requirements = [new ItemStack(Items.copper, 1)];
throughputVoid.size = 1;
throughputVoid.update = true;
throughputVoid.localizedName = "Display void";
throughputVoid.description = "Displays throughput.";

const jsBlock = extendContent(/*MessageBlock*/ Block, "js-block", {
    /*setMessageBlockText(player, tile, text){
        var h = Vars.mods.getScripts().runConsole(text);
        this.super$setMessageBlockText(player, tile, h);
    },*/
    tapped(tile, player){
        //this.super$tapped(tile, player);
        //tile.entity.message = Vars.mods.getScripts().runConsole(tile.entity.message);
        Vars.ui.scriptfrag.toggle();
    }
});

jsBlock.health = 1;
jsBlock.buildVisibility = Vars.mobile ? BuildVisibility.sandboxOnly : BuildVisibility.hidden;
jsBlock.requirements = [new ItemStack(Items.copper, 1)];
jsBlock.size = 1;
jsBlock.update = true;
jsBlock.localizedName = "Js block";
//jsBlock.description = "Executes input text as js.";

print("Testing loaded successfully");
