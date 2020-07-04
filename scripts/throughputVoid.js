//quezler's throughput ported to 5.0
this.global.delta = false;
const throughputVoid = extendContent(ItemVoid, "throughput-void", {
    setBars(){
        this.super$setBars();

        this.bars.add("throughput", func(entity => new Bar(
            prov(()=>"Throughput: " + Strings.fixed(entity.throughput(), 2) + "/s"),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
    },
    handleItem(item, tile, source){ tile.entity.iIncrement() }
});
throughputVoid.entityType = prov(ent => extend(TileEntity, {
    _i: 0,
    _window: new WindowedMean(60*10),
    _throughput: 0,

    iIncrement(){ this._i++ },
    throughput(){ return this._throughput },

    updateThroughput(){
        if(!this._window.hasEnoughData()) return;

        var val = this._window.getWindowValues().slice(30, 570);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._throughput = m/val.length;
    },
    update(){
        this.super$update();

        this._window.addValue(this._i * (this.global.delta ? 60 / Time.delta() : 60));
        this._i = 0;

        this.updateThroughput();
    }
}));

throughputVoid.health = 1;
throughputVoid.buildVisibility = BuildVisibility.sandboxOnly;
throughputVoid.requirements = [new ItemStack(Items.copper, 1)];
throughputVoid.size = 1;
throughputVoid.update = true;
throughputVoid.localizedName = "Display void";
throughputVoid.description = "Displays throughput. Type t!delta into the chat to disable or enable deltatime on calculations.";

const liquidThroughputVoid = extendContent(LiquidVoid, "liquid-throughput-void", {
    setBars(){
        this.super$setBars();

        this.bars.add("throughput", func(entity => new Bar(
            prov(()=>"Throughput: " + Strings.fixed(entity.throughput(), 2) + "/s"),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
    },
    handleLiquid(tile, source, liquid, amount) { tile.entity.iIncrement(amount) }
});
liquidThroughputVoid.entityType = prov(ent => extend(TileEntity, {
    _i: 0,
    _window: new WindowedMean(60*10),
    _throughput: 0,

    iIncrement(value){ this._i += value },
    throughput(){ return this._throughput },

    updateThroughput(){
        if(!this._window.hasEnoughData()) return;

        var val = this._window.getWindowValues().slice(30, 570);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._throughput = m/val.length;
    },
    update(){
        this.super$update();

        this._window.addValue(this._i * (this.global.delta ? 60 / Time.delta(): 60));
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
