import * as React from "react";
import {observer} from "mobx-react";
import {AppStore, WidgetConfig} from "stores";
import "./PlaceholderComponent.css";

class PlaceholderComponentProps {
    appStore: AppStore;
    id: string;
    label: string;
    docked: boolean;
}

@observer
export class PlaceholderComponent extends React.Component<PlaceholderComponentProps> {

    public static get WIDGET_CONFIG(): WidgetConfig {
        return {
            id: "placeholder",
            type: "placeholder",
            minWidth: 225,
            minHeight: 225,
            defaultWidth: 300,
            defaultHeight: 225,
            title: "Placeholder",
            isCloseable: true
        };
    }

    render() {
        return (
            <div className="placeholder-container">
                <h1>{this.props.label}</h1>
            </div>
        );
    }
}