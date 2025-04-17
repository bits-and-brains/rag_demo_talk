import {addtestCommand} from "./cmd_src/cmd_definitions/test command/AddCommand";
import {addMigrationsCommand} from "./cmd_src/cmd_definitions/migrations/AddCommand";
import {addSendMessageCommand} from "./cmd_src/cmd_definitions/send-message/AddCommand";
import {addQdrantPopulateCommand} from "./cmd_src/cmd_definitions/qdrant-populate/AddCommand";
import {Command} from "commander";
const program = new Command();

program.version('1.0.0');

addtestCommand(program);
addMigrationsCommand(program);
addSendMessageCommand(program);
addQdrantPopulateCommand(program);

program.parse();
