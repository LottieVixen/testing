const unitSpawner = extendContent(Block, "unit-spawner", {
    load(){
        this.region = Core.atlas.find(this.name);
        this.regionDraw = Core.atlas.find(this.name + "-draw");
    },

    buildConfiguration(tile, table){
        table.addImageButton(Icon.wrench, Styles.clearTransi, run(() => {
            this.pick(tile)
        })).size(50).disabled(boolf(b => tile.ent() == null));

        table.addImageButton(Icon.upOpen, Styles.clearTransi, run(() => {
            tile.configure(-1);
        })).size(50).disabled(boolf(b => tile.ent() == null));

        table.addImageButton(Icon.defense, Styles.clearTransi, run(() => {
            Vars.ui.showTextInput("Team", "Set Team", 3, tile.ent().team().id, cons(input => tile.configure(parseInt(input) + Vars.content.units().size)));
        })).size(50).disabled(boolf(b => tile.ent() == null));
    },
    pick(tile){
        const dialog = new FloatingDialog("");
        dialog.setFillParent(true);
        dialog.cont.pane(cons(p => {
            var i = 0;
            var units = Vars.content.units();

            units.each(cons(type => {
                p.addButton(cons(t => {
                    t.left();
                    t.addImage(type.icon(Cicon.medium)).size(40).padRight(2);
                    t.add(type.localizedName);
                }), run(() => {
                    tile.configure(type.id);
                    dialog.hide();
                })).pad(2).margin(12).fillX();
                if(++i % 3 == 0) p.row();
            }));
        }));

        dialog.show();
    },
    configured(tile, player, value){
        if(value == -1){
            var unit = tile.ent().unit().create(tile.entity.team());
            unit.set(tile.ent().getX(), tile.entity.getY());
            unit.add();
        } else if(value > Vars.content.units().size){
            tile.ent().setTeam(value - Vars.content.units().size);
        } else {
            tile.ent().setUnit(Vars.content.getByID(ContentType.unit, value))
        }
    },

    drawLayer(tile){
        Draw.mixcol(tile.entity.team().color, 1.0);
        Draw.rect(tile.entity.unit().icon(Cicon.medium), tile.drawx(), tile.drawy(), 5, 5);
        Draw.mixcol();
    },
    draw(tile){
        Draw.rect(this.regionDraw, tile.drawx(), tile.drawy(), 0);
    }
});
unitSpawner.entityType = prov(() => extend(TileEntity, {
    _unit: UnitTypes.dagger,
    _team: Team.sharded,

    unit(){ return this._unit },
    setUnit(unit){ this._unit = unit },
    team(){ return this._team },
    setTeam(team){ this._team = Team.get(team) },
    damage(amount){}
}));

unitSpawner.health = 1;
unitSpawner.layer = Layer.overlay;
unitSpawner.solid = false;
unitSpawner.configurable = true;
unitSpawner.buildVisibility = BuildVisibility.sandboxOnly;
unitSpawner.requirements(Category.units, ItemStack.with(Items.copper, 1));
unitSpawner.size = 1;
unitSpawner.update = true;
unitSpawner.localizedName = "Unit Spawner";
unitSpawner.description = "";
unitSpawner.targetable = false;
