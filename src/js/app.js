import { Application } from 'stimulus'
import FullScreenImageController from './controllers/fsimage_controller';

const application = Application.start()
application.register('fsimage', FullScreenImageController)
