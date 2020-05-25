function DamageIndicator(damage){
    this.time = 1;
    this.damage = damage;
}
const indicatorBlock = extendContent(Wall, "indicator-wall", {
    update(tile){
        this.super$update(tile);
        var entity = tile.ent();
        entity.setLabels(entity.getLabels().filter((lable, index)=>lable.time>0));
        entity.getLabels().forEach((lable, index)=>{
            lable.time = Mathf.lerpDelta(lable.time, 0, 0.80);
        });
        var delay = entity.getDelay();
        delay+=entity.delta();
        entity.setDelay(delay);
        if (delay>=10) {
            var total = 0;
            entity.setDelay(0);
            entity.getLabels().forEach(label=>total+=label.damage);
            entity.getLabels().forEach((lable, index)=>{
                Vars.ui.showLabel(lable.damage, 0.5, tile.drawx(), tile.drawy()+8+(8*index));
            });
            Vars.ui.showLabel(total, 0.5, tile.drawx(), tile.drawy()-8);
        }
    }
});
indicatorBlock.entityType = prov(()=>extend(TileEntity, {
    _labels: [],
    getLabels() {
        return this._labels;
    },
    setLabels(value) {
        this._labels = value;
    },
    _delay: 0,
    getDelay() {
        return this._delay;
    },
    setDelay(value) {
        this._delay = value;
    },
    damage(damage){
        this.getLabels().push(new DamageIndicator(damage));
    }
}));

indicatorBlock.health = 1;
indicatorBlock.buildVisibility = BuildVisibility.sandboxOnly;
indicatorBlock.requirements = [new ItemStack(Items.copper, 1)];
indicatorBlock.size = 1;
indicatorBlock.update = true;
indicatorBlock.localizedName = "Indicator block";
indicatorBlock.description = "Displays damage as labels, Sum of damage recieved in the last second(not exact) is displayed on the bottom.\n\n[yellow]Disclamer: Total damage recieved is not exactly dps.";

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
        this._window.addValue(this._i * (60 / Time.delta()));
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

const jsBlock = extendContent(MessageBlock, "js-block", {
    setMessageBlockText(player, tile, text){
        this.super$setMessageBlockText(player, tile, text);
        tile.entity.message = Vars.mods.getScripts().runConsole(text);
    },
    tapped(tile, player){
        this.super$tapped(tile, player);
        tile.entity.message = Vars.mods.getScripts().runConsole(text);
    }
});

jsBlock.health = 1;
jsBlock.buildVisibility = BuildVisibility.sandboxOnly;
jsBlock.requirements = [new ItemStack(Items.copper, 1)];
jsBlock.size = 1;
jsBlock.update = true;
jsBlock.localizedName = "Js block";
jsBlock.description = "Executes input text as js.";

print("Testing loaded successfully");
