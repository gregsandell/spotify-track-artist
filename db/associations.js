const createAssociations = ({
  trackModel,
  artistModel,
}) => {
  trackModel.hasMany(artistModel, {
    as: 'name',
    foreignKey: 'track_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
  });
  artistModel.belongsTo(trackModel, {
    foreignKey: 'track_id',
    targetKey: 'id',
  });
};

module.exports = createAssociations;
