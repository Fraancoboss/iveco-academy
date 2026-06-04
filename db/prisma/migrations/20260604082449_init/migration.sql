BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[dealers] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [dealers_id_df] DEFAULT NEWID(),
    [name] NVARCHAR(200) NOT NULL,
    [code] NVARCHAR(50) NOT NULL,
    [city] NVARCHAR(100) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [dealers_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [dealers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [dealers_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [users_id_df] DEFAULT NEWID(),
    [email] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [phone] NVARCHAR(50),
    [role] NVARCHAR(50) NOT NULL,
    [dealerId] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[schools] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [schools_id_df] DEFAULT NEWID(),
    [name] NVARCHAR(200) NOT NULL,
    [location] NVARCHAR(200) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [schools_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [schools_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[courses] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [courses_id_df] DEFAULT NEWID(),
    [schoolId] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [courses_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [courses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[editions] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [editions_id_df] DEFAULT NEWID(),
    [courseId] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [startDate] DATE NOT NULL,
    [endDate] DATE NOT NULL,
    [capacity] INT NOT NULL CONSTRAINT [editions_capacity_df] DEFAULT 12,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [editions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [editions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[modules] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [modules_id_df] DEFAULT NEWID(),
    [courseId] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [order] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [modules_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [modules_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[applications] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [applications_id_df] DEFAULT NEWID(),
    [candidateName] NVARCHAR(200) NOT NULL,
    [candidateEmail] NVARCHAR(255) NOT NULL,
    [candidatePhone] NVARCHAR(50),
    [dealerId] UNIQUEIDENTIFIER NOT NULL,
    [editionId] UNIQUEIDENTIFIER NOT NULL,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [applications_status_df] DEFAULT 'RECEIVED',
    [submittedAt] DATETIME2 NOT NULL CONSTRAINT [applications_submittedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [reviewedBy] UNIQUEIDENTIFIER,
    [reviewedAt] DATETIME2,
    CONSTRAINT [applications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[application_status_history] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [application_status_history_id_df] DEFAULT NEWID(),
    [applicationId] UNIQUEIDENTIFIER NOT NULL,
    [fromStatus] NVARCHAR(50) NOT NULL,
    [toStatus] NVARCHAR(50) NOT NULL,
    [changedBy] UNIQUEIDENTIFIER NOT NULL,
    [changedAt] DATETIME2 NOT NULL CONSTRAINT [application_status_history_changedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [notes] NVARCHAR(max),
    CONSTRAINT [application_status_history_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[enrollments] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [enrollments_id_df] DEFAULT NEWID(),
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [editionId] UNIQUEIDENTIFIER NOT NULL,
    [applicationId] UNIQUEIDENTIFIER NOT NULL,
    [enrolledAt] DATETIME2 NOT NULL CONSTRAINT [enrollments_enrolledAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [enrollments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [enrollments_applicationId_key] UNIQUE NONCLUSTERED ([applicationId]),
    CONSTRAINT [enrollments_userId_editionId_key] UNIQUE NONCLUSTERED ([userId],[editionId])
);

-- CreateTable
CREATE TABLE [dbo].[weeks] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [weeks_id_df] DEFAULT NEWID(),
    [editionId] UNIQUEIDENTIFIER NOT NULL,
    [weekNumber] INT NOT NULL,
    [weekType] NVARCHAR(50) NOT NULL,
    [moduleId] UNIQUEIDENTIFIER,
    [startDate] DATE NOT NULL,
    [endDate] DATE NOT NULL,
    CONSTRAINT [weeks_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [weeks_editionId_weekNumber_key] UNIQUE NONCLUSTERED ([editionId],[weekNumber])
);

-- CreateTable
CREATE TABLE [dbo].[evaluations] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [evaluations_id_df] DEFAULT NEWID(),
    [enrollmentId] UNIQUEIDENTIFIER NOT NULL,
    [weekId] UNIQUEIDENTIFIER NOT NULL,
    [evaluatorId] UNIQUEIDENTIFIER NOT NULL,
    [evalType] NVARCHAR(50) NOT NULL,
    [punctuality] DECIMAL(4,2),
    [attention] DECIMAL(4,2),
    [participation] DECIMAL(4,2),
    [documentation] DECIMAL(4,2),
    [dexterity] DECIMAL(4,2),
    [problemSolving] DECIMAL(4,2),
    [workshopGrade] DECIMAL(4,2),
    [comments] NVARCHAR(max),
    [evaluatedAt] DATETIME2 NOT NULL CONSTRAINT [evaluations_evaluatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [evaluations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [evaluations_enrollmentId_weekId_key] UNIQUE NONCLUSTERED ([enrollmentId],[weekId])
);

-- CreateTable
CREATE TABLE [dbo].[evaluation_module_items] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [evaluation_module_items_id_df] DEFAULT NEWID(),
    [evaluationId] UNIQUEIDENTIFIER NOT NULL,
    [itemName] NVARCHAR(200) NOT NULL,
    [score] DECIMAL(4,2) NOT NULL,
    CONSTRAINT [evaluation_module_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[attendances] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [attendances_id_df] DEFAULT NEWID(),
    [enrollmentId] UNIQUEIDENTIFIER NOT NULL,
    [weekId] UNIQUEIDENTIFIER NOT NULL,
    [present] BIT NOT NULL CONSTRAINT [attendances_present_df] DEFAULT 1,
    [notes] NVARCHAR(max),
    CONSTRAINT [attendances_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [attendances_enrollmentId_weekId_key] UNIQUE NONCLUSTERED ([enrollmentId],[weekId])
);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_dealerId_fkey] FOREIGN KEY ([dealerId]) REFERENCES [dbo].[dealers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[courses] ADD CONSTRAINT [courses_schoolId_fkey] FOREIGN KEY ([schoolId]) REFERENCES [dbo].[schools]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[editions] ADD CONSTRAINT [editions_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[courses]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[modules] ADD CONSTRAINT [modules_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[courses]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[applications] ADD CONSTRAINT [applications_dealerId_fkey] FOREIGN KEY ([dealerId]) REFERENCES [dbo].[dealers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[applications] ADD CONSTRAINT [applications_editionId_fkey] FOREIGN KEY ([editionId]) REFERENCES [dbo].[editions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[application_status_history] ADD CONSTRAINT [application_status_history_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[applications]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[enrollments] ADD CONSTRAINT [enrollments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[enrollments] ADD CONSTRAINT [enrollments_editionId_fkey] FOREIGN KEY ([editionId]) REFERENCES [dbo].[editions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[enrollments] ADD CONSTRAINT [enrollments_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[applications]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[weeks] ADD CONSTRAINT [weeks_editionId_fkey] FOREIGN KEY ([editionId]) REFERENCES [dbo].[editions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[weeks] ADD CONSTRAINT [weeks_moduleId_fkey] FOREIGN KEY ([moduleId]) REFERENCES [dbo].[modules]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[enrollments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_weekId_fkey] FOREIGN KEY ([weekId]) REFERENCES [dbo].[weeks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_evaluatorId_fkey] FOREIGN KEY ([evaluatorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[evaluation_module_items] ADD CONSTRAINT [evaluation_module_items_evaluationId_fkey] FOREIGN KEY ([evaluationId]) REFERENCES [dbo].[evaluations]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[attendances] ADD CONSTRAINT [attendances_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[enrollments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[attendances] ADD CONSTRAINT [attendances_weekId_fkey] FOREIGN KEY ([weekId]) REFERENCES [dbo].[weeks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
