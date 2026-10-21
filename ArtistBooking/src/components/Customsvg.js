import { SvgXml } from 'react-native-svg';
import React, { Component } from 'react';

class CustomSVG extends Component {
  modifySvgColor(svgString, color) {
    if (!color) return svgString;
    let updatedSvg = svgString;
    updatedSvg = updatedSvg.replace(/stroke=["'](.*?)["']/g, `stroke="${color}"`);

    return updatedSvg;
  }

  render() {
    const { name, color } = this.props;
    const modifiedXml = this.modifySvgColor(name, color);

    return (
      <SvgXml
        width={this.props.width}
        height={this.props.height}
        xml={modifiedXml}
        opacity={this.props.opacity}
        style={[{ flex: 1 }, this.props.styles]}
      />
    );
  }
}

export default CustomSVG;
