//dpsBlock
this.global.noPierce = false;
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
    updateTargeting(){
        this.target = null;
    },
    update(){
        if(this._owner.entity != this._ownerEnt) this.setDead(true);
        if(this.isDead()) {
            this.remove();
        }
    },
    onHit(b){
        this.super$onHit(b);
        if(!(b instanceof Bullet)) return;
        if(b.getBulletType().pierce && this.global.noPierce) b.remove();
    },

    countsAsEnemy(){ return false },
    drawAll(){}
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

    iIncrement(value){ this._i += value },
    dps(){ return this._dps },
    dps2(){ return this._dps2 },
    damage(damage){ this.iIncrement(damage) },

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

this.global.dpsUnit = dpsUnit;
