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
