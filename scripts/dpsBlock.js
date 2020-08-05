//dpsBlock
//this.global.noPierce = false;
//const getPierce = () => this.global.noPierce;
const dpsUnit = extendContent(UnitType, "dps-unit", {
    isHidden(){
        return true;
    }
});
dpsUnit.constructor = () => extend(Unit, {
    //this.spawner = bad

    _owner: null,
    _ownerEnt: null,

    damage(amount) {
        //reuse impl
        this._ownerEnt.damage(amount);
    },
    setOwner(tile){
        this._owner = tile;
        this._ownerEnt = tile.bc();
    },
    updateTargeting(){
        this.target = null;
    },
    update(){
        if(this._owner == null) {
            this._owner = this.tileOn();
            this._ownerEnt = this.tileOn().bc();
        }
        if(this._owner.bc() != this._ownerEnt) this.setDead(true);
        print("ohno")
        if(this.isDead()) {
            print("ohno")
            this.remove();
        }
    },
    onHit(b){
        this.super$onHit(b);
        if(!(b instanceof Bullet)) return;
        if(b.getBulletType().pierce && getPierce()) b.remove();
    },

    countsAsEnemy(){ return false },
    draw(){}
});

dpsUnit.drag = 1;
dpsUnit.speed = 0;
dpsUnit.maxVelocity = 0;
dpsUnit.range = 0;
dpsUnit.health = 1;

const dpsBlock = extendContent(Wall, "dps-wall", {
    setBars() {
        this.super$setBars();

        this.bars.add("dps", entity => new Bar(
            ()=>"DPS: " + Strings.fixed(entity.dps2(), 2),
            () => Pal.items,
            () => 1
        ));

        this.bars.add("dpsp", entity => new Bar(
            () => "DPSp: " + Strings.fixed(entity.dps(), 2) + "/s",
            () => Pal.items,
            () => 1
        ));
    }
});
dpsBlock.entityType = () => extend(Building, {
    _i: 0,
    _window: new WindowedMean(60*10),
    _dps: 0,
    _dps2: 0,

    iIncrement(value){ this._i += value },
    dps(){ return this._dps },
    dps2(){ return this._dps2 },
    damage(damage){ this.iIncrement(damage) },

    updateDps() {
        this._dps2 = this._window.mean();
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

        this._window.add(this._i * 60);
        this._i = 0;

        this.updateDps();
    },
    created(){
        if(Vars.net.client()) return;
        var unit = dpsUnit.create(Team.crux);
        unit.set(this.getX(), this.getY());
        unit.setOwner(this.tile);
        unit.add();
    }
});

dpsBlock.health = 1;
dpsBlock.solid = false;
dpsBlock.buildVisibility = BuildVisibility.sandboxOnly;
dpsBlock.requirements = ItemStack.with(Items.copper, 1);
dpsBlock.size = 1;
dpsBlock.update = true;
dpsBlock.localizedName = "Dps block";
dpsBlock.description = "Measures damage per second over a minute. Type t!flying in chat to toggle flying.\n\nSecond value shows percentile";

//this.global.dpsUnit = dpsUnit;
