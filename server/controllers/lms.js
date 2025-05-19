import { upload } from '../config/multerConfig.js';
import { queryAsync, mailSender, logError, logInfo, logWarning } from '../helper/index.js';
import { connectToDatabase, closeConnection } from '../database/mySql.js';
import { log } from 'console';



export class LMS {
  static upload = upload; // Make Multer instance available to routes

  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Extract additional form data
      const { moduleId, subModuleId, unitId } = req.body;

      // Here you would typically save to database
      const fileData = {
        name: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        type: req.file.mimetype,
        size: req.file.size,
        moduleId,
        subModuleId,
        unitId,
        uploadedBy: req.user.id // From fetchUser middleware
      };

      // Save to database (pseudo-code)
      // const savedFile = await FileModel.create(fileData);

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
      // Your existing sub-modules logic
      const subModules = []; // Fetch from database
      res.json({ success: true, subModules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUnits(req, res) {
    try {
      // Your existing units logic
      const units = []; // Fetch from database
      res.json({ success: true, units });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveLearningMaterials(req, res) {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in request body',
        data: req.body
      });
    }

    const { ModuleName, ModuleImage, ModuleDescription, subModules } = req.body.module;
 
    
    const userEmail = req.user.id;
    
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    let conn;

    try {
      conn = await new Promise((resolve, reject) => {
        connectToDatabase((err, connection) => {
          if (err) {
            console.error('Database connection error:', err);
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });

      await queryAsync(conn, 'BEGIN TRANSACTION');

      const userQuery = `
      SELECT UserID, Name, isAdmin 
      FROM Community_User 
      WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
    `;
      const userRows = await queryAsync(conn, userQuery, [userEmail]);


      if (userRows.length === 0) {
        throw new Error("User not found, please login first.");
      }
      const user = userRows[0];

      const moduleInsertQuery = `
      INSERT INTO ModulesDetails 
      (ModuleName, ModuleImage, ModuleDescription, AuthAdd, AddOnDt, delStatus) 
      OUTPUT INSERTED.ModuleID
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    console.log(req.body);
    
      const moduleResult = await queryAsync(conn, moduleInsertQuery, [
        ModuleName,
        // ModuleImage ? Buffer.from(ModuleImage, 'base64') : null,
        ModuleImage ? Buffer.from(ModuleImage.split(',')[1], 'base64') : null,
        ModuleDescription || null,
        user.Name,
        currentDateTime,
        0
      ]);

      if (!moduleResult || moduleResult.length === 0) {
        throw new Error('Failed to insert module - no ID returned');
      }
      const moduleId = moduleResult[0].ModuleID;
      console.log("Success in Module Query : Module ID - ", moduleId);
      console.log("Submodule here :- ", subModules);
      
      for (const subModule of subModules) {
        const subModuleInsertQuery = `
        INSERT INTO SubModulesDetails 
        (SubModuleName, SubModuleImage, SubModuleDescription, ModuleID, AuthAdd, AddOnDt, delStatus) 
        OUTPUT INSERTED.SubModuleID
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `;
        const subModuleResult = await queryAsync(conn, subModuleInsertQuery, [
          subModule.SubModuleName,
          subModule.SubModuleImage ? Buffer.from(subModule.SubModuleImage, 'base64') : null,
          subModule.SubModuleDescription || null,
          moduleId,
          user.Name,
          currentDateTime
        ]);

        if (!subModuleResult || subModuleResult.length === 0) {
          throw new Error('Failed to insert submodule - no ID returned');
        }
        const subModuleId = subModuleResult[0].SubModuleID;
      console.log("Success in submodule Query : sub Module ID - ", subModuleId);

        for (const unit of subModule.Units || []) {
          const unitInsertQuery = `
          INSERT INTO UnitsDetails 
          (UnitName, UnitImg, UnitDescription, SubModuleID, AuthAdd, AddOnDt, delStatus) 
          OUTPUT INSERTED.UnitID
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
          const unitResult = await queryAsync(conn, unitInsertQuery, [
            unit.UnitName,
            unit.UnitImg ? Buffer.from(unit.UnitImg, 'base64') : null,
            unit.UnitDescription || null,
            subModuleId,
            user.Name,
            currentDateTime
          ]);

          if (!unitResult || unitResult.length === 0) {
            throw new Error('Failed to insert unit - no ID returned');
          }
          const unitId = unitResult[0].UnitID;

          // ✅ Fixed file insert logic (loop one-by-one)
          if (unit.Files && unit.Files.length > 0) {
            for (const file of unit.Files) {
              const fileInsertQuery = `
              INSERT INTO FilesDetails 
              (FilesName, FilePath, FileType, UnitID, AuthAdd, AddOnDt, delStatus) 
              VALUES (?, ?, ?, ?, ?, ?, 0)
            `;
              await queryAsync(conn, fileInsertQuery, [
                file.FilesName,
                file.FilePath,
                file.FileType,
                unitId,
                user.Name,
                currentDateTime
              ]);
              console.log("Success in unit Query ");
            }
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
        await queryAsync(conn, 'ROLLBACK TRANSACTION').catch(rbErr =>
          console.error('Rollback failed:', rbErr)
        );
        conn.release?.();
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save learning materials',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
}
