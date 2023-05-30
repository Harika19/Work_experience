

/* STORED PROCEDURE */
DROP PROCEDURE IF EXISTS transferJobs;
DELIMITER $$
 
 CREATE PROCEDURE transferJobs() 
 BEGIN
 
 DECLARE exit handler for sqlexception
   BEGIN
   ROLLBACK;
 END;
 
 START TRANSACTION;
 UPDATE ScheduledBusinessEvents SET status = 'InProgress' WHERE executionTime <= NOW() AND status IS NULL;
 INSERT IGNORE INTO business_events.ScheduledExecutionBusinessEvents(clientId,eventId,businessEventId,entityId,executionTime,dateCreated,lastModified) SELECT 		clientId,eventId,businessEventId,entityId,executionTime,dateCreated,lastModified FROM ScheduledBusinessEvents WHERE status = 'InProgress';
 UPDATE ScheduledBusinessEvents SET status = 'Completed' WHERE executionTime <= NOW() AND status = 'InProgress';
 COMMIT;
 END
 $$


/* EVENT SCHEDULER */
DROP EVENT IF EXISTS jobs_polling_event_scheduler;
DELIMITER $$ CREATE EVENT IF NOT EXISTS jobs_polling_event_scheduler 
ON SCHEDULE EVERY 20 SECOND 
ON COMPLETION PRESERVE DO 
BEGIN
   CALL transferJobs();
END
 $$ DELIMITER ;