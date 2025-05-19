import { upload } from '../config/multerConfig.js';
import { queryAsync, mailSender, logError, logInfo, logWarning } from '../helper/index.js';
import { connectToDatabase, closeConnection } from '../database/mySql.js';

export class LMS {
  static upload = upload;

  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { moduleId, subModuleId, unitId } = req.body;
      const fileData = {
        originalName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        moduleId,
        subModuleId,
        unitId,
        uploadedBy: req.user.id
      };

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: fileData
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'File upload failed'
      });
    }
  }

  static async getSubModules(req, res) {
    try {
      const subModules = [];
      res.json({ success: true, subModules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUnits(req, res) {
    try {
      const units = [];
      res.json({ success: true, units });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveLearningMaterials(req, res) {
    if (!req.body || !req.body.module) {
      return res.status(400).json({
        success: false,
        message: 'Missing required module data'
      });
    }

<<<<<<< HEAD
    const { ModuleName, ModuleImage, ModuleDescription, subModules = [] } = req.body.module;
=======
    const { ModuleName, ModuleImage, ModuleDescription, subModules } = req.body.module;
 
    
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd
    const userEmail = req.user.id;
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    let conn;

    try {
      conn = await new Promise((resolve, reject) => {
        connectToDatabase((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
        });
      });

      await queryAsync(conn, 'BEGIN TRANSACTION');

      // Get user details
      const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
      const userRows = await queryAsync(conn, userQuery, [userEmail]);

      if (userRows.length === 0) {
        throw new Error("User not found");
      }
      const user = userRows[0];

      // Insert module
      const moduleInsertQuery = `
        INSERT INTO ModulesDetails 
        (ModuleName, ModuleImage, ModuleDescription, AuthAdd, AddOnDt, delStatus) 
        OUTPUT INSERTED.ModuleID
        VALUES (?, ?, ?, ?, ?, 0)
      `;
      
      let moduleImageBuffer = null;
      if (ModuleImage && typeof ModuleImage === 'string' && ModuleImage.startsWith('data:')) {
        moduleImageBuffer = Buffer.from(ModuleImage.split(',')[1], 'base64');
      }

      const moduleResult = await queryAsync(conn, moduleInsertQuery, [
        ModuleName,
        moduleImageBuffer,
        ModuleDescription || null,
        user.Name,
        currentDateTime
      ]);

      if (!moduleResult || moduleResult.length === 0) {
        throw new Error('Failed to insert module');
      }
      const moduleId = moduleResult[0].ModuleID;

      // Process submodules
      for (const subModule of subModules) {
        const { SubModuleName, SubModuleImage, SubModuleDescription, units = [] } = subModule;
        
        let subModuleImageBuffer = null;
        if (SubModuleImage && typeof SubModuleImage === 'string' && SubModuleImage.startsWith('data:')) {
          subModuleImageBuffer = Buffer.from(SubModuleImage.split(',')[1], 'base64');
        }

        const subModuleInsertQuery = `
          INSERT INTO SubModulesDetails 
          (SubModuleName, SubModuleImage, SubModuleDescription, ModuleID, AuthAdd, AddOnDt, delStatus) 
          OUTPUT INSERTED.SubModuleID
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        const subModuleResult = await queryAsync(conn, subModuleInsertQuery, [
          SubModuleName,
          subModuleImageBuffer,
          SubModuleDescription || null,
          moduleId,
          user.Name,
          currentDateTime
        ]);

        if (!subModuleResult || subModuleResult.length === 0) {
          throw new Error('Failed to insert submodule');
        }
        const subModuleId = subModuleResult[0].SubModuleID;

        // Process units
        for (const unit of units) {
          const { UnitName, UnitImg, UnitDescription, files = [] } = unit;
          
          let unitImageBuffer = null;
          if (UnitImg && typeof UnitImg === 'string' && UnitImg.startsWith('data:')) {
            unitImageBuffer = Buffer.from(UnitImg.split(',')[1], 'base64');
          }

          const unitInsertQuery = `
            INSERT INTO UnitsDetails 
            (UnitName, UnitImg, UnitDescription, SubModuleID, AuthAdd, AddOnDt, delStatus) 
            OUTPUT INSERTED.UnitID
            VALUES (?, ?, ?, ?, ?, ?, 0)
          `;
          const unitResult = await queryAsync(conn, unitInsertQuery, [
            UnitName,
            unitImageBuffer,
            UnitDescription || null,
            subModuleId,
            user.Name,
            currentDateTime
          ]);

          if (!unitResult || unitResult.length === 0) {
            throw new Error('Failed to insert unit');
          }
          const unitId = unitResult[0].UnitID;

          // Process files
          for (const file of files) {
            if (!file.FilePath || !file.FileType) continue;

            const fileInsertQuery = `
              INSERT INTO FilesDetails 
              (FilesName, FilePath, FileType, UnitID, AuthAdd, AddOnDt, delStatus) 
              VALUES (?, ?, ?, ?, ?, ?, 0)
            `;
            await queryAsync(conn, fileInsertQuery, [
              file.FilesName || 'Untitled',
              file.FilePath,
              file.FileType,
              unitId,
              user.Name,
              currentDateTime
            ]);
          }
        }
      }

      await queryAsync(conn, 'COMMIT TRANSACTION');

      return res.status(201).json({
        success: true,
        message: 'Learning materials saved successfully',
        moduleId
      });

    } catch (error) {
      console.error('Error saving learning materials:', error);

      if (conn) {
        await queryAsync(conn, 'ROLLBACK TRANSACTION').catch(console.error);
        conn.release?.();
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save learning materials',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    } finally {
      if (conn) conn.release?.();
    }
  }
}