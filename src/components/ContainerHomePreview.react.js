import _ from 'underscore';
import React from 'react/addons';
import request from 'request';
import shell from 'shell';
import metrics from '../utils/MetricsUtil';
import ContainerHomeWebPreview from './ContainerHomeWebPreview.react';

var ContainerHomePreview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  reload: function () {
    var webview = document.getElementById('webview');
    if (webview) {
      var url = webview.src;
      request(url, err => {
        if (err && err.code === 'ECONNREFUSED') {
          setTimeout(this.reload, 2000);
        } else {
          try {
            webview.reload();
          } catch (err) {}
        }
      });
    }
  },

  componentWillUnmount: function () {
    clearInterval(this.timer);
  },

  handleClickPreview: function () {
    if (this.props.defaultPort) {
      metrics.track('Opened In Browser', {
        from: 'preview'
      });
      shell.openExternal('http://' + this.props.ports[this.props.defaultPort].url);
    }
  },

  handleClickNotShowingCorrectly: function () {
    metrics.track('Viewed Port Settings', {
      from: 'preview'
    });
    this.context.router.transitionTo('containerSettingsPorts', {name: this.context.router.getCurrentParams().name});
  },

  render: function () {
    var preview;
    if (this.props.defaultPort) {
      preview = (<ContainerHomeWebPreview ports={this.props.ports} defaultPort={this.props.defaultPort}/>);
    } else {
      var ports = _.map(_.pairs(this.props.ports), pair => {
        var key = pair[0];
        var val = pair[1];
        return (
          <tr key={key}>
            <td>{key + '/' + val.portType}</td>
            <td>{val.url}</td>
          </tr>
        );
      });

      preview = (
        <div className="web-preview wrapper">
          <div className="widget">
            <div className="top-bar">
              <div className="text">IP & PORTS</div>
              <div className="action" onClick={this.handleClickNotShowingCorrectly}>
                <span className="icon icon-preferences"></span>
              </div>
            </div>
            <p>You can access this container using the following IP address and port:</p>
            <table className="table">
              <thead>
                <tr>
                  <th>DOCKER PORT</th>
                  <th>ACCESS URL</th>
                </tr>
              </thead>
              <tbody>
                {ports}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return preview;
  }
});

module.exports = ContainerHomePreview;
