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
    validateTarget(tile){
        var ent = tile.ent();
        return !(ent.target == null || (!ent.target.withinDst(tile.drawx(), tile.drawy(), this.range)) || !ent.target.isValid());
    },
    findTarget(tile){
        tile.entity.target = Units.closestTarget(Team.green, tile.drawx(), tile.drawy(), this.range, boolf(e=>true), boolf(e => !e.entity.isDead() && e.entity.block.name!="testing-dps-turret" ));
    },

    drawLayer(tile){},
    hasAmmo(tile){ return true },
    peekAmmo(tile){ return Bullets.standardCopper }
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
    unit.block = dpsTurret;
    return unit;
});

dpsTurret.health = 100;
dpsTurret.reload = 10;
dpsTurret.size = 1;
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
