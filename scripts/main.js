//unitSpawner
const unitSpawner = extendContent(Block, "unit-spawner", {
    buildConfiguration(tile, table){
        table.addImageButton(Icon.wrench, Styles.clearTransi, run(() => {
            tile.configure(0);
        })).size(50).disabled(boolf(b => tile.entity == null));

        table.addImageButton(Icon.upOpen, Styles.clearTransi, run(() => {
            tile.configure(1);
        })).size(50).disabled(boolf(b => tile.entity == null));

        table.addImageButton(Icon.defense, Styles.clearTransi, run(() => {
            tile.configure(2);
        })).size(50).disabled(boolf(b => tile.entity == null));
    },
    pick(tile){
        const dialog = new FloatingDialog("");
        dialog.setFillParent(true);
        dialog.cont.pane(cons(p => {
            var i = 0;
            var units = Vars.content.units();
            units.each(cons(type=>{
                p.addButton(cons(t => {
                    t.left();
                    t.addImage(type.icon(Cicon.medium)).size(40).padRight(2);
                    t.add(type.localizedName);
                }), run(() => {
                    tile.entity.setUnit(type);
                    dialog.hide();
                })).pad(2).margin(12).fillX();
                if(++i % 3 == 0) p.row();
            }));
        }));
        dialog.show();
    },
    configured(tile, player, value){
        //yes im terrible at this
        var handle = [
           (tile) => this.pick(tile),
           (tile) => {
               var unit = tile.entity.unit().create(tile.entity.team());
               unit.set(tile.entity.getX(), tile.entity.getY());
               unit.add();
           },
           (tile) => tile.entity.setTeam(tile.entity.team() == Team.sharded ? Team.crux : Team.sharded)
        ];
        handle[value](tile);
    }
});
unitSpawner.entityType = prov(() => extend(TileEntity, {
    _unit: UnitTypes.dagger,
    _team: Team.crux,
    unit(){ return this._unit },
    setUnit(unit){ this._unit = unit },
    team(){ return this._team },
    setTeam(team){ this._team = team }
}));

unitSpawner.health = 1;
unitSpawner.solid = false;
unitSpawner.configurable = true;
unitSpawner.buildVisibility = BuildVisibility.sandboxOnly;
unitSpawner.requirements = [new ItemStack(Items.copper, 1)];
unitSpawner.size = 1;
unitSpawner.update = true;
unitSpawner.localizedName = "Unit Spawner";
unitSpawner.description = "";
//dpsTurret
//stripped down turret
const dpsTurret = extendContent(ItemTurret, "dps-turret", {
    tapped(tile){
        var ent = tile.ent();
        var dmg = ent.getDmg();
        Vars.ui.showTextInput("DPS", "DPS", (dmg*6).toString(), cons(string => ent.setDmg(string.valueOf()/6)));
    },
    updateShooting(tile){
        var entity = tile.ent();

        if(entity.reload >= this.reload){
            entity.target.damage(entity.getDmg());

            entity.reload = 0;
        }else{
            entity.reload += tile.entity.delta() * this.baseReloadSpeed(tile);
        }
    },
    drawLayer(tile){},
    findTarget(tile){
        tile.entity.target = Units.closestEnemy(Team.crux, tile.drawx(), tile.drawy(), range);
    }
});
dpsTurret.entityType = prov(() => {
    var unit = extendContent(ItemTurret.ItemTurretEntity, dpsTurret, {
        _dmg: 10,
        getDmg(){
            return this._dmg;
        },
        setDmg(value){
            this._dmg = value;
        }
    });
    return unit;
});

dpsTurret.health = 1;
dpsTurret.reload = 10;
dpsTurret.size = 2;
dpsTurret.category = Category.turret;
dpsTurret.shootCone = 22.5;
dpsTurret.buildVisibility = BuildVisibility.sandboxOnly;
dpsTurret.localizedName = "Dps Turret";
dpsTurret.range = 100;
dpsTurret.description = "stripped down turret that deals damage according to input, does not shoot actual bullets!";
dpsTurret.requirements = ItemStack.with(Items.copper, 1);
dpsTurret.ammo(
    Items.copper, Bullets.standardCopper
);

//infoNode
const iNode = extendContent(PowerNode, "info-node", {
    setBars(){
        this.super$setBars();

        this.bars.add("power-i", func(entity => new Bar(
            prov(() => "N/P: " + 
                (entity.power.graph.getPowerNeeded() > 0 ? "-" : "") + Strings.fixed(entity.power.graph.getPowerNeeded() * (60 / entity.delta()), 1) + "/" + 
                (entity.power.graph.getPowerProduced() > 0 ? "+" : "") + Strings.fixed(entity.power.graph.getPowerProduced() * (60 / entity.delta()), 1)
            ),
            prov(() => Pal.powerBar),
            floatp(() => entity.power.graph.getSatisfaction())
        )));
    }
});

iNode.health = 1;
iNode.maxNodes = 99;
iNode.buildVisibility = BuildVisibility.sandboxOnly;
iNode.requirements = [new ItemStack(Items.copper, 1)];
iNode.size = 1;
iNode.update = true;
iNode.localizedName = "Info Node";
iNode.description = "";

//dpsBlock
var noPierce = false;
const dpsUnit = new UnitType("dps-unit", prov(a => extend(GroundUnit, {
    //this.spawner = bad

    _owner: null,
    _ownerEnt: null,

    damage(amount) {
        //reuse impl
        this._ownerEnt.damage(amount);
    },
    setOwner(tile){
        this._owner = tile;
        this._ownerEnt = tile.ent();
    },
    behavior(){},
    updateTargeting(){
        this.target = null;
    },
    update(){
        if(this._owner.entity != this._ownerEnt) this.setDead(true);
        if(this.isDead()) {
            this.remove();
        }
    },
    countsAsEnemy(){
        return false;
    },
    drawAll(){},
    onHit(b){
        this.super$onHit(b);
        if(!(b instanceof Bullet)) return;
        if(b.getBulletType().pierce && noPierce) b.remove();
    }
})));

dpsUnit.drag = 1;
dpsUnit.speed = 0;
dpsUnit.maxVelocity = 0;
dpsUnit.range = 0;
dpsUnit.health = 1;
dpsUnit.weapon = UnitTypes.draug.weapon;

const dpsBlock = extendContent(Wall, "dps-wall", {
    placed(tile){
        this.super$placed(tile);

        if(Vars.net.client()) return;
        var unit = dpsUnit.create(Team.crux);
        unit.set(tile.drawx(), tile.drawy());
        unit.setOwner(tile);
        unit.add();
    },
    setBars() {
        this.super$setBars();

        this.bars.add("dps", func(entity => new Bar(
            prov(()=>"DPS: " + Strings.fixed(entity.dps2(), 2)),
            prov(() => Pal.items),
            floatp(() => 1)
        )));

        this.bars.add("dpsp", func(entity => new Bar(
            prov(()=>"DPSp: " + Strings.fixed(entity.dps(), 2) + "/s"),
            prov(() => Pal.items),
            floatp(() => 1)
        )));
    }
});
dpsBlock.entityType = prov(()=>extend(TileEntity, {
    _i: 0,
    _window: new WindowedMean(60*10),
    _dps: 0,
    _dps2: 0,

    iIncrement(value){
        this._i += value;
    },
    dps(){
        return this._dps;
    },
    dps2(){
        return this._dps2;
    },
    damage(damage){
        this.iIncrement(damage);
    },
    updateDps() {
        this._dps2 = this._window.getMean();
        if(!this._window.hasEnoughData()) return;
        var val = this._window.getWindowValues().slice(30, 570);
        var m = 0;
        val.forEach(v=>{
            m += v;
        });
        this._dps = m/val.length;
    },
    update() {
        this.super$update();

        this._window.addValue(this._i * 60);
        this._i = 0;

        this.updateDps();
    }
}));

dpsBlock.health = 1;
dpsBlock.solid = false;
dpsBlock.buildVisibility = BuildVisibility.sandboxOnly;
dpsBlock.requirements = [new ItemStack(Items.copper, 1)];
dpsBlock.size = 1;
dpsBlock.update = true;
dpsBlock.layer = Layer.overlay;
dpsBlock.localizedName = "Dps block";
dpsBlock.description = "Measures damage per second over a minute. Type t!flying in chat to toggle flying.\n\nSecond value shows percentile";

//quezler's throughput ported to 5.0
var delta = false;
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

        this._window.addValue(this._i * (delta ? 60 / Time.delta() : 60));
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

        this._window.addValue(this._i * (delta ? 60 / Time.delta(): 60));
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
jsBlock.description = "Executes input text as js.";

if(!this.global.done){
    this.global.done = true;
    Events.on(EventType.PlayerChatEvent, cons(e=>{
        if(e.message=="t!delta"){
            Call.sendChatMessage("Toggled throughput deltatime");
            delta = !delta;
        }
        if(e.message=="t!flying"){
            Call.sendChatMessage("Toggled flying for dpsBlock");
            dpsUnit.flying = !dpsUnit.flying;
        }
        if(e.message=="t!nopierce"){
            Call.sendChatMessage("Toggled piercing for dpsBlock");
            noPierce = !noPierce;
        }
    }));
}
print("Testing loaded successfully");
