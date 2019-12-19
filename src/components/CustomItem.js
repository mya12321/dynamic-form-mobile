export default {
  name: 'CustomItem',
  functional: true,
  props: {
    item: Object,
  },
  render: (h, ctx) => ctx.props.item.render(h, ctx.props.item),
};
